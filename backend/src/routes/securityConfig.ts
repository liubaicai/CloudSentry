import express from 'express';
import { securityController } from '../controllers/securityController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

router.get('/', securityController.getSecurityConfigs);
router.get('/:id', securityController.getSecurityConfigById);
router.post('/', securityController.createSecurityConfig);
router.patch('/:id', securityController.updateSecurityConfig);
router.delete('/:id', securityController.deleteSecurityConfig);

export default router;
