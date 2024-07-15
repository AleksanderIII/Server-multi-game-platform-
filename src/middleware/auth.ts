import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'supersecret';

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token; // Получаем токен из httpOnly куки
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded as { userId: number };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};