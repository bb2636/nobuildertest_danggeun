import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createPostValidator,
  postIdParamValidator,
  postListQueryValidator,
  updatePostValidator,
  updateStatusValidator,
} from '../validators/post.validator';

const router = Router();

router.get('/', optionalAuthMiddleware, validateRequest(postListQueryValidator), (req, res) => postController.getList(req, res));
router.get('/:id', validateRequest(postIdParamValidator), (req, res) => postController.getDetail(req, res));
router.post('/', authMiddleware, validateRequest(createPostValidator), (req, res) => postController.create(req, res));
router.put('/:id', authMiddleware, validateRequest(updatePostValidator), (req, res) => postController.update(req, res));
router.delete('/:id', authMiddleware, validateRequest(postIdParamValidator), (req, res) => postController.delete(req, res));
router.patch('/:id/status', authMiddleware, validateRequest(updateStatusValidator), (req, res) => postController.updateStatus(req, res));

export default router;
