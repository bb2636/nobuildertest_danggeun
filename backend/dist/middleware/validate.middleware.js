"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const express_validator_1 = require("express-validator");
function validateRequest(validations) {
    return async (req, res, next) => {
        await Promise.all(validations.map((v) => v.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            next();
            return;
        }
        const firstError = errors.array()[0];
        const message = firstError && 'msg' in firstError ? String(firstError.msg) : '입력값을 확인해주세요.';
        res.status(400).json({ message });
    };
}
//# sourceMappingURL=validate.middleware.js.map