import { Router } from 'express';
import { getDashboardStats, getTimeSeriesData } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.use(apiLimiter);

router.get('/stats', getDashboardStats);
router.get('/timeseries', getTimeSeriesData);

export default router;
