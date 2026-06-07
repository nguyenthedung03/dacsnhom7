import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { authMiddleware } from './middleware/auth.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { Request, Response } from 'express';
import * as http from 'http';

// Route map: /api/<prefix> → http://<service>:<port>/<servicePrefix>
const ROUTES: { prefix: string; target: string }[] = [
  { prefix: '/api/auth',     target: 'http://auth-service:3001/auth' },
  { prefix: '/api/comics',   target: 'http://comic-service:3002/comics' },
  { prefix: '/api/chapters', target: 'http://chapter-service:3003/chapters' },
  { prefix: '/api/search',   target: 'http://search-service:3005/search' },
  { prefix: '/api/chatbot',  target: 'http://chatbot-service:3006/chatbot' },
  { prefix: '/api/orders',   target: 'http://payment-service:3007/orders' },
];

function makeProxyMiddleware(targetBase: string) {
  const url = new URL(targetBase);
  const hostname = url.hostname;
  const port = parseInt(url.port) || 80;
  const basePath = url.pathname;

  return (req: Request, res: Response) => {
    // Strip /api/xxx prefix, keep the rest
    // e.g. /api/chatbot/message/123 → /message/123 → prepend basePath → /chatbot/message/123
    const apiPrefix = ROUTES.find(r => req.originalUrl.startsWith(r.prefix))?.prefix || '';
    const rest = req.originalUrl.slice(apiPrefix.length) || '/';
    const targetPath = basePath.replace(/\/$/, '') + (rest.startsWith('/') ? rest : '/' + rest);

    const options: http.RequestOptions = {
      hostname,
      port,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${hostname}:${port}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error(`[Gateway] Proxy error → ${targetBase}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({ message: `Service unavailable: ${err.message}` });
      }
    });

    req.pipe(proxyReq, { end: true });
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.use(loggerMiddleware);
  app.use(authMiddleware);

  // Register proxy routes
  for (const route of ROUTES) {
    const handler = makeProxyMiddleware(route.target);
    (app as any).use(route.prefix, handler);
  }

  await app.listen(3000);
  console.log('API Gateway running on port 3000');
  console.log('Routes:', ROUTES.map(r => `${r.prefix} → ${r.target}`).join(', '));
}
bootstrap();
