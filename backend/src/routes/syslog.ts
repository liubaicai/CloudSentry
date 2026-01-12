import { Router } from 'express';
import { receiveSyslog, bulkReceiveSyslog } from '../controllers/syslogController';
import { syslogLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public endpoints for syslog ingestion (protected with rate limiting)
router.post('/', syslogLimiter, receiveSyslog);
router.post('/bulk', syslogLimiter, bulkReceiveSyslog);

export default router;
