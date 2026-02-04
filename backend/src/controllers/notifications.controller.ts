import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { communityRepository } from '../repositories/community.repository';
import { chatRepository } from '../repositories/chat.repository';
import { getPublicMessage } from '../utils/errorResponse';
import { logger } from '../utils/logger';

export const notificationsController = {
  async getCounts(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    try {
      const [communityCommentCount, chatUnreadCount] = await Promise.all([
        communityRepository.countCommentsOnMyPostsByOthers(userId),
        chatRepository.countRoomsWithLastMessageFromOther(userId),
      ]);
      res.json({
        communityCommentCount,
        chatUnreadCount,
      });
    } catch (e) {
      const err = e as Error;
      logger.error('notifications.getCounts', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },
};
