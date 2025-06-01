// routes/resignationRoutes.js
import express from 'express';

import {
  concludeResignation,
  getAllResignations,
  submitResignation,
} from '../controllers/resignationController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  employeeOnly,
  hrOnly,
} from '../middleware/roleMiddleware.js';

const router = express.Router();

// Employee submits a resignation
router.post(
  '/user/resign',
  protect,           // verifies JWT & sets req.user
  employeeOnly,      // only role === 'EMPLOYEE'
  submitResignation
);

// HR views all resignations
router.get(
  '/admin/resignations',
  protect,           // verifies JWT
  hrOnly,            // only role === 'HR'
  getAllResignations
);

// HR approves/rejects a resignation
router.put(
  '/admin/conclude_resignation',
  protect,
  hrOnly,
  concludeResignation
);

export default router;
