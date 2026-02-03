import { Router } from 'express';
import { locationController } from '../controllers/location.controller';

const router = Router();

router.get('/', (req, res) => locationController.getList(req, res));

export default router;
