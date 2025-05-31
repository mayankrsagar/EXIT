// backend/routes/userRoutes.js
import express from 'express';

import { submitExitInterview } from '../controllers/exitController.js';
import { submitResignation } from '../controllers/resignationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/user/resign
// Body: { intendedLastWorkingDay }
router.post('/resign', protect, submitResignation);

// POST /api/user/responses
// Body: { responses: [ ... ] }
router.post('/responses', protect, submitExitInterview);

export default router;
