/**
 * 찜 라우트: postId param 검증(express-validator) 적용
 */
import { Router } from 'express';
import { favoriteController } from '../controllers/favorite.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { postIdParamValidator } from '../validators/favorite.validator';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => favoriteController.list(req, res));
router.get('/check/:postId', validateRequest(postIdParamValidator), (req, res) =>
  favoriteController.check(req, res)
);
router.post('/toggle/:postId', validateRequest(postIdParamValidator), (req, res) =>
  favoriteController.toggle(req, res)
);

export default router;
