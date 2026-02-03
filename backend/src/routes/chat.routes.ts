/**
 * 채팅 라우트: roomId/ postId 등 param·body 검증(express-validator) 적용
 */
import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  getOrCreateRoomValidator,
  roomIdParamValidator,
  sendMessageValidator,
} from '../validators/chat.validator';

const router = Router();

router.use(authMiddleware);

router.post('/rooms', validateRequest(getOrCreateRoomValidator), (req, res) =>
  chatController.getOrCreateRoom(req, res)
);
router.get('/rooms', (req, res) => chatController.getRoomList(req, res));
router.get('/rooms/:roomId', validateRequest(roomIdParamValidator), (req, res) =>
  chatController.getRoomDetail(req, res)
);
router.get('/rooms/:roomId/messages', validateRequest(roomIdParamValidator), (req, res) =>
  chatController.getMessages(req, res)
);
router.post('/rooms/:roomId/messages', validateRequest(sendMessageValidator), (req, res) =>
  chatController.sendMessage(req, res)
);

export default router;
