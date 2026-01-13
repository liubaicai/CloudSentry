import express from 'express';
import { operationsController } from '../controllers/operationsController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

router.get('/', operationsController.getOperationsConfigs);
router.get('/:id', operationsController.getOperationsConfigById);
router.post('/', operationsController.createOperationsConfig);
router.patch('/:id', operationsController.updateOperationsConfig);
router.delete('/:id', operationsController.deleteOperationsConfig);

export default router;
