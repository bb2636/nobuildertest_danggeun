import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger';
import { AuthRequest } from './auth.middleware';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = randomUUID();
  (req as Request & { requestId?: string }).requestId = requestId;
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.request({
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      userId: (req as AuthRequest).userId,
      durationMs,
    });
  });

  next();
}
