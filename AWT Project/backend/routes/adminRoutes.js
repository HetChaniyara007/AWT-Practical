import express from 'express';
import { getAnalytics, getUsers } from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/analytics', protect, admin, getAnalytics);
router.get('/users', protect, admin, getUsers);

export default router;
