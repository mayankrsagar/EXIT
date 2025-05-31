// routes/exitInterviewRoutes.js
import express from 'express';

import {
  getAllExitInterviews,
  submitExitInterview,
} from '../controllers/exitInterviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  employeeOnly,
  hrOnly,
} from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/user/exit_interview
 * @desc    Employee submits an exit interview (after resignation is approved)
 * @access  Employee (authenticated)
 */
router.post(
  '/user/exit_interview',
  protect,          // verify JWT
  employeeOnly,     // only role==="EMPLOYEE"
  submitExitInterview
);

/**
 * @route   GET /api/admin/exit_interviews
 * @desc    HR views all exit interviews submitted by employees
 * @access  HR (authenticated)
 */
router.get(
  '/admin/exit_interviews',
  protect,          // verify JWT
  hrOnly,           // only role==="HR"
  getAllExitInterviews
);

export default router;
