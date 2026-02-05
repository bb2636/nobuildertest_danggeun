"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageValidator = exports.createAppointmentValidator = exports.postIdParamValidator = exports.roomIdParamValidator = exports.getOrCreateRoomValidator = void 0;
const express_validator_1 = require("express-validator");
exports.getOrCreateRoomValidator = [
    (0, express_validator_1.body)('postId')
        .notEmpty()
        .withMessage('postId는 필수입니다.')
        .toInt()
        .isInt({ min: 1 })
        .withMessage('postId는 1 이상이어야 합니다.'),
];
exports.roomIdParamValidator = [
    (0, express_validator_1.param)('roomId')
        .isInt({ min: 1 })
        .withMessage('올바른 채팅방 ID가 아닙니다.'),
];
exports.postIdParamValidator = [
    (0, express_validator_1.param)('postId')
        .isInt({ min: 1 })
        .withMessage('올바른 게시글 ID가 아닙니다.'),
];
exports.createAppointmentValidator = [
    (0, express_validator_1.param)('roomId').isInt({ min: 1 }).withMessage('올바른 채팅방 ID가 아닙니다.'),
    (0, express_validator_1.body)('date').trim().notEmpty().withMessage('날짜를 입력해주세요.'),
    (0, express_validator_1.body)('time').trim().notEmpty().withMessage('시간을 입력해주세요.'),
    (0, express_validator_1.body)('place').trim().notEmpty().withMessage('장소를 입력해주세요.'),
];
exports.sendMessageValidator = [
    (0, express_validator_1.param)('roomId').isInt({ min: 1 }).withMessage('올바른 채팅방 ID가 아닙니다.'),
    (0, express_validator_1.body)('content')
        .trim()
        .notEmpty()
        .withMessage('메시지 내용을 입력해주세요.')
        .isLength({ max: 2048 })
        .withMessage('메시지/URL은 2048자 이하여야 합니다.'),
];
//# sourceMappingURL=chat.validator.js.map