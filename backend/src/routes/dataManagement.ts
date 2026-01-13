import express from 'express';
import { dataManagementController } from '../controllers/dataManagementController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

router.get('/stats', dataManagementController.getStats);
router.post('/delete-old-events', dataManagementController.deleteOldEvents);
router.get('/export', dataManagementController.exportEvents);
router.get('/count', dataManagementController.getEventCountByDateRange);
router.post('/backup', dataManagementController.createBackup);
router.post('/maintenance', dataManagementController.runMaintenance);

export default router;
