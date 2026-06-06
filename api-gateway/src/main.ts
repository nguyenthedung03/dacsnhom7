// api-gateway/src/main.ts
// THAY THẾ TOÀN BỘ NỘI DUNG FILE NÀY

import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module';
import { authMiddleware } from './middleware/auth.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(loggerMiddleware);
  app.use(authMiddleware);

  // Existing routes
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://auth-service:3001/auth',
      changeOrigin: true,
    }),
  );

  app.use(
    '/api/comics',
    createProxyMiddleware({
      target: 'http://comic-service:3002/comics',
      changeOrigin: true,
    }),
  );

  app.use(
    '/api/chapters',
    createProxyMiddleware({
      target: 'http://chapter-service:3003/chapters',
      changeOrigin: true,
    }),
  );

  app.use(
    '/api/search',
    createProxyMiddleware({
      target: 'http://search-service:3005/search',
      changeOrigin: true,
    }),
  );

  // NEW: AI Chatbot Service
  app.use(
    '/api/chatbot',
    createProxyMiddleware({
      target: 'http://chatbot-service:3006/chatbot',
      changeOrigin: true,
    }),
  );

  // NEW: Payment & Order Service
  app.use(
    '/api/orders',
    createProxyMiddleware({
      target: 'http://payment-service:3007/orders',
      changeOrigin: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
