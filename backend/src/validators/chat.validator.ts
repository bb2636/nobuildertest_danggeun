import { body, param } from 'express-validator';

export const getOrCreateRoomValidator = [
  body('postId')
    .notEmpty()
    .withMessage('postId는 필수입니다.')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('postId는 1 이상이어야 합니다.'),
];

export const roomIdParamValidator = [
  param('roomId')
    .isInt({ min: 1 })
    .withMessage('올바른 채팅방 ID가 아닙니다.'),
];

export const sendMessageValidator = [
  param('roomId').isInt({ min: 1 }).withMessage('올바른 채팅방 ID가 아닙니다.'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('메시지 내용을 입력해주세요.')
    .isLength({ max: 2000 })
    .withMessage('메시지는 2000자 이하여야 합니다.'),
];
