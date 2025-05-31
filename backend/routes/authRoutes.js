// routes/authRoutes.js
import express from 'express';

import {
  login,
  register,
} from '../controllers/authController.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Employee or HR)
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user (Employee or HR) and receive a JWT
 * @access  Public
 */
router.post('/login', login);

export default router;
