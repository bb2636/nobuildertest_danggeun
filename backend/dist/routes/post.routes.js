"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const post_validator_1 = require("../validators/post.validator");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.optionalAuthMiddleware, (0, validate_middleware_1.validateRequest)(post_validator_1.postListQueryValidator), (req, res) => post_controller_1.postController.getList(req, res));
router.get('/:id', (0, validate_middleware_1.validateRequest)(post_validator_1.postIdParamValidator), (req, res) => post_controller_1.postController.getDetail(req, res));
router.post('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateRequest)(post_validator_1.createPostValidator), (req, res) => post_controller_1.postController.create(req, res));
router.put('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateRequest)(post_validator_1.updatePostValidator), (req, res) => post_controller_1.postController.update(req, res));
router.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateRequest)(post_validator_1.postIdParamValidator), (req, res) => post_controller_1.postController.delete(req, res));
router.patch('/:id/status', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateRequest)(post_validator_1.updateStatusValidator), (req, res) => post_controller_1.postController.updateStatus(req, res));
exports.default = router;
//# sourceMappingURL=post.routes.js.map