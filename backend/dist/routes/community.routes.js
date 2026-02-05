"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const community_controller_1 = require("../controllers/community.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const community_validator_1 = require("../validators/community.validator");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.optionalAuthMiddleware, (0, validate_middleware_1.validateRequest)(community_validator_1.communityListQueryValidator), (req, res) => community_controller_1.communityController.getList(req, res));
router.get('/my-comments', auth_middleware_1.authMiddleware, (req, res) => community_controller_1.communityController.getMyComments(req, res));
router.post('/notifications/read', auth_middleware_1.authMiddleware, (req, res) => community_controller_1.communityController.markNotificationsRead(req, res));
router.get('/:id/comments', (0, validate_middleware_1.validateRequest)(community_validator_1.communityPostIdParamValidator), (req, res) => community_controller_1.communityController.getComments(req, res));
router.post('/:id/comments', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateRequest)(community_validator_1.createCommentValidator), (req, res) => community_controller_1.communityController.createComment(req, res));
router.get('/:id', (0, validate_middleware_1.validateRequest)(community_validator_1.communityPostIdParamValidator), (req, res) => community_controller_1.communityController.getDetail(req, res));
router.post('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateRequest)(community_validator_1.createCommunityPostValidator), (req, res) => community_controller_1.communityController.create(req, res));
router.put('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateRequest)(community_validator_1.updateCommunityPostValidator), (req, res) => community_controller_1.communityController.update(req, res));
router.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateRequest)(community_validator_1.communityPostIdParamValidator), (req, res) => community_controller_1.communityController.delete(req, res));
exports.default = router;
//# sourceMappingURL=community.routes.js.map