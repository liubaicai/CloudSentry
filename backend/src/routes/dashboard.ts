import { Router } from 'express';
import { getDashboardStats, getTimeSeriesData } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/timeseries', getTimeSeriesData);

export default router;
