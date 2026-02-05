import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const favoriteController: {
    toggle(req: AuthRequest, res: Response): Promise<void>;
    check(req: AuthRequest, res: Response): Promise<void>;
    list(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=favorite.controller.d.ts.map