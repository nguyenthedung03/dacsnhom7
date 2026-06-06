// api-gateway/src/middleware/auth.middleware.ts
// THAY THẾ TOÀN BỘ NỘI DUNG FILE NÀY

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = 'comic_secret_key';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Routes cần ADMIN — loại trừ các endpoint dành cho user thường
  const adminOnlyRoutes = ['/api/comics', '/api/chapters'];
  const userComicExceptions = ['/review', '/increment-purchase'];
  const isAdminRoute =
    adminOnlyRoutes.some((route) => req.originalUrl.startsWith(route)) &&
    ['POST', 'PATCH', 'DELETE'].includes(req.method) &&
    !userComicExceptions.some((exc) => req.originalUrl.includes(exc));

  // Routes cần đăng nhập (USER hoặc ADMIN)
  const userProtectedRoutes = ['/api/orders'];
  const isUserRoute = userProtectedRoutes.some((route) =>
    req.originalUrl.startsWith(route),
  );

  // Chatbot không cần auth (session-based)
  if (!isAdminRoute && !isUserRoute) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req['user'] = decoded;

    if (isAdminRoute && decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Admin only' });
    }

    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
