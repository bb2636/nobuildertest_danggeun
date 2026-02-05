import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: number;
}
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
/** 토큰이 있으면 req.userId 설정, 없거나 유효하지 않으면 설정하지 않음 (401 하지 않음) */
export declare function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map