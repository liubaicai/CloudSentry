import { Router } from 'express';
import {
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/eventsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getEvents);
router.get('/:id', getEventById);
router.patch('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
