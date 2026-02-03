import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { loginValidator, signUpValidator, updateProfileValidator } from '../validators/auth.validator';

const router = Router();

router.post('/signup', validateRequest(signUpValidator), (req, res) => authController.signUp(req, res));
router.post('/login', validateRequest(loginValidator), (req, res) => authController.login(req, res));
router.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));
router.patch('/me', authMiddleware, validateRequest(updateProfileValidator), (req, res) => authController.updateMe(req, res));

export default router;
