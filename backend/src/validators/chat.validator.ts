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

export const postIdParamValidator = [
  param('postId')
    .isInt({ min: 1 })
    .withMessage('올바른 게시글 ID가 아닙니다.'),
];

export const createAppointmentValidator = [
  param('roomId').isInt({ min: 1 }).withMessage('올바른 채팅방 ID가 아닙니다.'),
  body('date').trim().notEmpty().withMessage('날짜를 입력해주세요.'),
  body('time').trim().notEmpty().withMessage('시간을 입력해주세요.'),
  body('place').trim().notEmpty().withMessage('장소를 입력해주세요.'),
];

export const sendMessageValidator = [
  param('roomId').isInt({ min: 1 }).withMessage('올바른 채팅방 ID가 아닙니다.'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('메시지 내용을 입력해주세요.')
    .isLength({ max: 2048 })
    .withMessage('메시지/URL은 2048자 이하여야 합니다.'),
];
