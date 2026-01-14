import { Router } from 'express';
import { getSetupStatus, completeSetup } from '../controllers/setupController';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Check if system is initialized (no auth required)
router.get('/status', getSetupStatus);

// Complete initial setup (rate limited, no auth required)
router.post('/complete', authLimiter, completeSetup);

export default router;
