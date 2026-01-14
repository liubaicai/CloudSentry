import { Router } from 'express';
import { getSystemInfo } from '../controllers/systemInfoController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.use(apiLimiter);

router.get('/', getSystemInfo);

export default router;
