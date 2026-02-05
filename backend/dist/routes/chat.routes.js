"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 채팅 라우트: roomId/ postId 등 param·body 검증(express-validator) 적용
 */
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const chat_validator_1 = require("../validators/chat.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.post('/rooms', (0, validate_middleware_1.validateRequest)(chat_validator_1.getOrCreateRoomValidator), (req, res) => chat_controller_1.chatController.getOrCreateRoom(req, res));
router.get('/rooms', (req, res) => chat_controller_1.chatController.getRoomList(req, res));
router.get('/posts/:postId/rooms', (0, validate_middleware_1.validateRequest)(chat_validator_1.postIdParamValidator), (req, res) => chat_controller_1.chatController.getRoomsByPostId(req, res));
router.get('/rooms/:roomId', (0, validate_middleware_1.validateRequest)(chat_validator_1.roomIdParamValidator), (req, res) => chat_controller_1.chatController.getRoomDetail(req, res));
router.get('/rooms/:roomId/messages', (0, validate_middleware_1.validateRequest)(chat_validator_1.roomIdParamValidator), (req, res) => chat_controller_1.chatController.getMessages(req, res));
router.post('/rooms/:roomId/messages', (0, validate_middleware_1.validateRequest)(chat_validator_1.sendMessageValidator), (req, res) => chat_controller_1.chatController.sendMessage(req, res));
router.post('/rooms/:roomId/read', (0, validate_middleware_1.validateRequest)(chat_validator_1.roomIdParamValidator), (req, res) => chat_controller_1.chatController.markRoomRead(req, res));
router.post('/rooms/:roomId/leave', (0, validate_middleware_1.validateRequest)(chat_validator_1.roomIdParamValidator), (req, res) => chat_controller_1.chatController.leaveRoom(req, res));
router.post('/rooms/:roomId/appointments', (0, validate_middleware_1.validateRequest)(chat_validator_1.createAppointmentValidator), (req, res) => chat_controller_1.chatController.createAppointment(req, res));
exports.default = router;
//# sourceMappingURL=chat.routes.js.map