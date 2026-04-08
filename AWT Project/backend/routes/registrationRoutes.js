import express from 'express';
import { registerForEvent, getMyTickets } from '../controllers/registrationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/:eventId', protect, registerForEvent);
router.get('/my-tickets', protect, getMyTickets);

export default router;
