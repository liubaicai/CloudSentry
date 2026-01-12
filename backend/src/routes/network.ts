import express from 'express';
import { networkController } from '../controllers/networkController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

router.get('/', networkController.getNetworkConfigs);
router.get('/:id', networkController.getNetworkConfigById);
router.post('/', networkController.createNetworkConfig);
router.patch('/:id', networkController.updateNetworkConfig);
router.delete('/:id', networkController.deleteNetworkConfig);

export default router;
