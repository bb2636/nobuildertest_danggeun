import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const postController: {
    getList(req: AuthRequest, res: Response): Promise<void>;
    getDetail(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
    updateStatus(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=post.controller.d.ts.map