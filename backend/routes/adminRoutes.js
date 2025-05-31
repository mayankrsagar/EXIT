// backend/routes/adminRoutes.js
import express from 'express';

import { getAllExitInterviews } from '../controllers/exitController.js';
import {
  concludeResignation,
  getAllResignations,
} from '../controllers/resignationController.js';
import {
  hrOnly,
  protect,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/admin/resignations
router.get('/resignations', protect, hrOnly, getAllResignations);

// PUT /api/admin/conclude_resignation
router.put('/conclude_resignation', protect, hrOnly, concludeResignation);

// GET /api/admin/exit_responses
router.get('/exit_responses', protect, hrOnly, getAllExitInterviews);

export default router;
