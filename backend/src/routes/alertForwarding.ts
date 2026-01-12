import { Router } from 'express';
import {
  getRules,
  createRule,
  updateRule,
  deleteRule,
} from '../controllers/alertForwardingController';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.use(apiLimiter);

router.get('/', getRules);
router.post('/', authorize('admin'), createRule);
router.patch('/:id', authorize('admin'), updateRule);
router.delete('/:id', authorize('admin'), deleteRule);

export default router;
