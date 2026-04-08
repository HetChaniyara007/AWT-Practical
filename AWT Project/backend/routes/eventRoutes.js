import express from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { protect, clubAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, clubAdmin, createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, clubAdmin, updateEvent)
  .delete(protect, clubAdmin, deleteEvent);

export default router;
