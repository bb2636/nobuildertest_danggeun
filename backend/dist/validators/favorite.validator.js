"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postIdParamValidator = void 0;
const express_validator_1 = require("express-validator");
exports.postIdParamValidator = [
    (0, express_validator_1.param)('postId')
        .isInt({ min: 1 })
        .withMessage('올바른 게시글 ID가 아닙니다.'),
];
//# sourceMappingURL=favorite.validator.js.map