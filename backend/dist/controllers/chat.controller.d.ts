import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const chatController: {
    getOrCreateRoom(req: AuthRequest, res: Response): Promise<void>;
    getRoomList(req: AuthRequest, res: Response): Promise<void>;
    /** 해당 게시글에 대한 대화중인 채팅방 목록 */
    getRoomsByPostId(req: AuthRequest, res: Response): Promise<void>;
    getRoomDetail(req: AuthRequest, res: Response): Promise<void>;
    getMessages(req: AuthRequest, res: Response): Promise<void>;
    sendMessage(req: AuthRequest, res: Response): Promise<void>;
    /** 약속잡기 (게시글 주인만) */
    createAppointment(req: AuthRequest, res: Response): Promise<void>;
    markRoomRead(req: AuthRequest, res: Response): Promise<void>;
    leaveRoom(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=chat.controller.d.ts.map