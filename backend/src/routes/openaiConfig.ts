import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getOpenAIConfig,
  getAllOpenAIConfigs,
  createOpenAIConfig,
  updateOpenAIConfig,
  deleteOpenAIConfig,
  testOpenAIConnection,
} from '../controllers/openaiConfigController';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllOpenAIConfigs);
router.get('/active', getOpenAIConfig);
router.get('/test', testOpenAIConnection);
router.post('/', createOpenAIConfig);
router.put('/:id', updateOpenAIConfig);
router.delete('/:id', deleteOpenAIConfig);

export default router;
