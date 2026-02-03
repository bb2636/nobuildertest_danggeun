import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { favoriteService } from '../services/favorite.service';
import { getPublicMessage } from '../utils/errorResponse';
import { logger } from '../utils/logger';

export const favoriteController = {
  async toggle(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const postId = Number(req.params.postId);
    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
      return;
    }
    try {
      const result = await favoriteService.toggle(userId, postId);
      res.json(result);
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      if (err.statusCode === 404) {
        res.status(404).json({ message: err.message });
        return;
      }
      logger.error('favorite.toggle', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async check(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const postId = Number(req.params.postId);
    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
      return;
    }
    try {
      const favorited = await favoriteService.check(userId, postId);
      res.json({ favorited });
    } catch (e) {
      const err = e as Error;
      logger.error('favorite.check', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async list(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    try {
      const posts = await favoriteService.getFavoritePosts(userId);
      res.json({ posts });
    } catch (e) {
      const err = e as Error;
      logger.error('favorite.list', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },
};
