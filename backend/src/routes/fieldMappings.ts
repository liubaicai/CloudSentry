import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAllFieldMappings,
  getFieldMapping,
  createFieldMapping,
  updateFieldMapping,
  deleteFieldMapping,
} from '../controllers/fieldMappingController';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllFieldMappings);
router.get('/:id', getFieldMapping);
router.post('/', createFieldMapping);
router.patch('/:id', updateFieldMapping);
router.delete('/:id', deleteFieldMapping);

export default router;
