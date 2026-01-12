import { Router } from 'express';
import {
  getSettings,
  updateSetting,
  deleteSetting,
} from '../controllers/settingsController';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));
router.use(apiLimiter);

router.get('/', getSettings);
router.post('/', updateSetting);
router.delete('/:key', deleteSetting);

export default router;
