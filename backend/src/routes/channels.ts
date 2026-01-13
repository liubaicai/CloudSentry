import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import {
  getAllChannels,
  getChannel,
  createChannel,
  updateChannel,
  deleteChannel,
  getChannelStats,
  generateAIMappings,
  applyAIMappings,
} from '../controllers/channelController';

const router = Router();

// All routes require authentication and rate limiting
router.use(authenticate, apiLimiter);

router.get('/', getAllChannels);
router.get('/stats', getChannelStats);
router.get('/:id', getChannel);
router.post('/', createChannel);
router.patch('/:id', updateChannel);
router.delete('/:id', deleteChannel);

// AI mapping routes
router.post('/:id/ai-mappings/generate', generateAIMappings);
router.post('/:id/ai-mappings/apply', applyAIMappings);

export default router;
