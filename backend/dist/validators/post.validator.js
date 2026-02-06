"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusValidator = exports.postListQueryValidator = exports.postIdParamValidator = exports.updatePostValidator = exports.createPostValidator = void 0;
const express_validator_1 = require("express-validator");
const STATUS_VALUES = ['SALE', 'RESERVED', 'SOLD'];
exports.createPostValidator = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('제목은 필수입니다.')
        .isLength({ max: 100 })
        .withMessage('제목은 100자 이하여야 합니다.'),
    (0, express_validator_1.body)('content')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('설명은 2000자 이하여야 합니다.'),
    (0, express_validator_1.body)('price')
        .optional({ values: 'null' })
        .custom((v) => {
        if (v == null || v === '')
            return true;
        const n = Number(v);
        return Number.isInteger(n) && n >= 0 && n <= 999999999999;
    })
        .withMessage('가격은 0원 이상, 최대 12자리(999,999,999,999원)까지 입력할 수 있습니다.'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(STATUS_VALUES)
        .withMessage(`status는 ${STATUS_VALUES.join(', ')} 중 하나여야 합니다.`),
    (0, express_validator_1.body)('category').optional().trim().isLength({ max: 50 }),
    (0, express_validator_1.body)('locationName').optional().trim().isLength({ max: 100 }),
    (0, express_validator_1.body)('locationCode').optional().trim().isLength({ max: 20 }),
    (0, express_validator_1.body)('imageUrls')
        .optional({ values: 'null' })
        .isArray()
        .withMessage('imageUrls는 배열이어야 합니다.'),
    (0, express_validator_1.body)('imageUrls.*')
        .optional()
        .isString()
        .custom((v) => {
        if (!v || typeof v !== 'string')
            return true;
        // 전체 URL(http/https) 또는 서버 내 경로(/로 시작) 허용
        return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/');
    })
        .withMessage('imageUrls 항목은 URL 또는 경로(/) 문자열이어야 합니다.'),
];
exports.updatePostValidator = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
    (0, express_validator_1.body)('title').optional().trim().isLength({ max: 100 }),
    (0, express_validator_1.body)('content').optional().trim().isLength({ max: 2000 }),
    (0, express_validator_1.body)('price').optional().isInt({ min: 0, max: 999999999999 }).withMessage('가격은 0원 이상, 최대 12자리까지 입력할 수 있습니다.'),
    (0, express_validator_1.body)('status').optional().isIn(STATUS_VALUES),
    (0, express_validator_1.body)('category').optional().trim().isLength({ max: 50 }),
    (0, express_validator_1.body)('locationName').optional().trim().isLength({ max: 100 }),
    (0, express_validator_1.body)('locationCode').optional().trim().isLength({ max: 20 }),
    (0, express_validator_1.body)('imageUrls').optional({ values: 'null' }).isArray(),
    (0, express_validator_1.body)('imageUrls.*')
        .optional()
        .isString()
        .custom((v) => {
        if (!v || typeof v !== 'string')
            return true;
        return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/');
    }),
];
exports.postIdParamValidator = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
];
exports.postListQueryValidator = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('page는 1 이상의 정수여야 합니다.'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit는 1~50 사이여야 합니다.'),
    (0, express_validator_1.query)('locationCode').optional().trim().isLength({ max: 20 }),
    (0, express_validator_1.query)('status').optional().isIn(STATUS_VALUES),
    (0, express_validator_1.query)('keyword').optional().trim().isLength({ max: 100 }),
    (0, express_validator_1.query)('category').optional().trim().isLength({ max: 50 }),
    (0, express_validator_1.query)('my').optional().isIn(['1', '0', 'true', 'false']).withMessage('my는 1 또는 0이어야 합니다.'),
];
exports.updateStatusValidator = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
    (0, express_validator_1.body)('status')
        .notEmpty()
        .withMessage('status는 필수입니다.')
        .isIn(STATUS_VALUES)
        .withMessage(`status는 ${STATUS_VALUES.join(', ')} 중 하나여야 합니다.`),
];
//# sourceMappingURL=post.validator.js.map