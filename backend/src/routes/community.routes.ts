import { Router } from 'express';
import { communityController } from '../controllers/community.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  communityPostIdParamValidator,
  communityListQueryValidator,
  createCommunityPostValidator,
  updateCommunityPostValidator,
  createCommentValidator,
} from '../validators/community.validator';

const router = Router();

router.get('/', optionalAuthMiddleware, validateRequest(communityListQueryValidator), (req, res) => communityController.getList(req, res));
router.get('/my-comments', authMiddleware, (req, res) => communityController.getMyComments(req, res));
router.post('/notifications/read', authMiddleware, (req, res) => communityController.markNotificationsRead(req, res));
router.get('/:id/comments', validateRequest(communityPostIdParamValidator), (req, res) => communityController.getComments(req, res));
router.post('/:id/comments', authMiddleware, validateRequest(createCommentValidator), (req, res) => communityController.createComment(req, res));
router.get('/:id', validateRequest(communityPostIdParamValidator), (req, res) => communityController.getDetail(req, res));
router.post('/', authMiddleware, validateRequest(createCommunityPostValidator), (req, res) => communityController.create(req, res));
router.put('/:id', authMiddleware, validateRequest(updateCommunityPostValidator), (req, res) => communityController.update(req, res));
router.delete('/:id', authMiddleware, validateRequest(communityPostIdParamValidator), (req, res) => communityController.delete(req, res));

export default router;
