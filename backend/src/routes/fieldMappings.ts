import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import {
  getAllFieldMappings,
  getFieldMapping,
  createFieldMapping,
  updateFieldMapping,
  deleteFieldMapping,
} from '../controllers/fieldMappingController';

const router = Router();

// All routes require authentication and rate limiting
router.use(authenticate, apiLimiter);

router.get('/', getAllFieldMappings);
router.get('/:id', getFieldMapping);
router.post('/', createFieldMapping);
router.patch('/:id', updateFieldMapping);
router.delete('/:id', deleteFieldMapping);

export default router;
