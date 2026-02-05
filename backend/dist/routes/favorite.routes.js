"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 찜 라우트: postId param 검증(express-validator) 적용
 */
const express_1 = require("express");
const favorite_controller_1 = require("../controllers/favorite.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const favorite_validator_1 = require("../validators/favorite.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', (req, res) => favorite_controller_1.favoriteController.list(req, res));
router.get('/check/:postId', (0, validate_middleware_1.validateRequest)(favorite_validator_1.postIdParamValidator), (req, res) => favorite_controller_1.favoriteController.check(req, res));
router.post('/toggle/:postId', (0, validate_middleware_1.validateRequest)(favorite_validator_1.postIdParamValidator), (req, res) => favorite_controller_1.favoriteController.toggle(req, res));
exports.default = router;
//# sourceMappingURL=favorite.routes.js.map