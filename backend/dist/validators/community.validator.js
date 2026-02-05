"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentValidator = exports.updateCommunityPostValidator = exports.createCommunityPostValidator = exports.communityListQueryValidator = exports.communityPostIdParamValidator = void 0;
const express_validator_1 = require("express-validator");
exports.communityPostIdParamValidator = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
];
exports.communityListQueryValidator = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
    (0, express_validator_1.query)('locationCode').optional().trim().isLength({ max: 20 }),
    (0, express_validator_1.query)('topic').optional().trim().isLength({ max: 50 }),
    (0, express_validator_1.query)('sort').optional().isIn(['latest', 'popular']).withMessage('sort는 latest 또는 popular이어야 합니다.'),
    (0, express_validator_1.query)('keyword').optional().trim().isLength({ max: 100 }),
    (0, express_validator_1.query)('my').optional().isIn(['1', '0']).withMessage('my는 1 또는 0이어야 합니다.'),
];
exports.createCommunityPostValidator = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('제목은 필수입니다.')
        .isLength({ max: 200 })
        .withMessage('제목은 200자 이하여야 합니다.'),
    (0, express_validator_1.body)('content').optional().trim(),
    (0, express_validator_1.body)('topic').optional().trim().isLength({ max: 50 }),
    (0, express_validator_1.body)('locationName').optional().trim().isLength({ max: 100 }),
    (0, express_validator_1.body)('locationCode').optional().trim().isLength({ max: 20 }),
];
exports.updateCommunityPostValidator = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
    (0, express_validator_1.body)('title').optional().trim().isLength({ max: 200 }),
    (0, express_validator_1.body)('content').optional().trim(),
    (0, express_validator_1.body)('topic').optional().trim().isLength({ max: 50 }),
];
exports.createCommentValidator = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
    (0, express_validator_1.body)('content')
        .trim()
        .notEmpty()
        .withMessage('댓글 내용을 입력해주세요.')
        .isLength({ max: 1000 })
        .withMessage('댓글은 1000자 이하여야 합니다.'),
];
//# sourceMappingURL=community.validator.js.map