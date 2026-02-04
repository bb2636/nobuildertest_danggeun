import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { notificationsController } from '../controllers/notifications.controller';

const router = Router();

router.get('/counts', authMiddleware, (req, res) =>
  notificationsController.getCounts(req, res)
);

export default router;
