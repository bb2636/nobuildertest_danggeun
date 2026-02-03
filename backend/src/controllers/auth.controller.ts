import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';
import { getPublicMessage } from '../utils/errorResponse';
import { logger } from '../utils/logger';

export const authController = {
  async signUp(req: Request, res: Response): Promise<void> {
    const { email, password, nickname, locationName, locationCode } = req.body;
    if (!email || !password || !nickname) {
      res.status(400).json({ message: '이메일, 비밀번호, 닉네임은 필수입니다.' });
      return;
    }
    try {
      const result = await authService.signUp({
        email,
        password,
        nickname,
        locationName,
        locationCode,
      });
      res.status(201).json(result);
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      const code = err.statusCode ?? 500;
      if (code >= 500) logger.error('auth.signUp', err);
      res.status(code).json({ message: getPublicMessage(err, code) });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
      return;
    }
    try {
      const result = await authService.login(email, password);
      res.json(result);
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      const code = err.statusCode ?? 500;
      if (code >= 500) logger.error('auth.login', err);
      res.status(code).json({ message: getPublicMessage(err, code) });
    }
  },

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    try {
      const user = await authService.getMe(userId);
      if (!user) {
        res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        return;
      }
      res.json({ user });
    } catch (e) {
      const err = e as Error;
      logger.error('auth.getMe', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async updateMe(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const { nickname, locationName, locationCode, profileImageUrl } = req.body;
    try {
      const user = await authService.updateProfile(userId, {
        nickname,
        locationName: locationName ?? undefined,
        locationCode: locationCode ?? undefined,
        profileImageUrl: profileImageUrl ?? undefined,
      });
      if (!user) {
        res.status(400).json({ message: '변경할 내용이 없습니다.' });
        return;
      }
      res.json({ user });
    } catch (e) {
      const err = e as Error;
      logger.error('auth.updateMe', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },
};
