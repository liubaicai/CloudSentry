import { Router } from 'express';
import { receiveSyslog, bulkReceiveSyslog } from '../controllers/syslogController';

const router = Router();

// Public endpoints for syslog ingestion (can be protected with API keys in production)
router.post('/', receiveSyslog);
router.post('/bulk', bulkReceiveSyslog);

export default router;
