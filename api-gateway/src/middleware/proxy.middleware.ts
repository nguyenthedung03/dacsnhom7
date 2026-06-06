import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const authProxy = createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
});

const comicProxy = createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
});

const chapterProxy = createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
});

export function proxyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.url.startsWith('/api/auth')) {
    authProxy(req, res, next);
  } else if (req.url.startsWith('/api/comics')) {
    comicProxy(req, res, next);
  } else if (req.url.startsWith('/api/chapters')) {
    chapterProxy(req, res, next);
  } else {
    next();
  }
}