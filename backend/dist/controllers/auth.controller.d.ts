import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const authController: {
    signUp(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    getMe(req: AuthRequest, res: Response): Promise<void>;
    updateMe(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=auth.controller.d.ts.map