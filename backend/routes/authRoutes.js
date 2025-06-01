// backend/routes/authRoutes.js
import express from 'express';
import {
  body,
  validationResult,
} from 'express-validator';

import {
  login,
  register,
} from '../controllers/authController.js';

const router = express.Router();

// Registration: expects { username, password } (email optional)
router.post(
  '/register',
  [
    body('username')
      .isAlphanumeric()
      .withMessage(
        '"username" must only contain alpha-numeric characters'
      )
      .notEmpty()
      .withMessage('"username" cannot be empty'),
    body('password')
      .isLength({ min: 4 })
      .withMessage('"password" should have at least 4 characters'),
    // We do not require email in the request → service will auto‐generate.
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array().map((e) => e.msg) });
    }
    next();
  },
  register
);

// Login: accepts { username, password } or { email, password }
router.post(
  '/login',
  [
    // If username is provided, skip email check. If email is provided, ensure it is valid.
    body('username')
      .if((value, { req }) => !req.body.email)
      .notEmpty()
      .withMessage('"username" is required'),
    body('email')
      .if((value, { req }) => !req.body.username)
      .isEmail()
      .withMessage('"email" must be a valid email'),
    body('password')
      .isLength({ min: 4 })
      .withMessage('"password" should have at least 4 characters'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array().map((e) => e.msg) });
    }
    next();
  },
  login
);

export default router;
