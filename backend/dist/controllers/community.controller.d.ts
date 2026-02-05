import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const communityController: {
    getList(req: AuthRequest, res: Response): Promise<void>;
    getDetail(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
    getComments(req: AuthRequest, res: Response): Promise<void>;
    getMyComments(req: AuthRequest, res: Response): Promise<void>;
    markNotificationsRead(req: AuthRequest, res: Response): Promise<void>;
    createComment(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=community.controller.d.ts.map