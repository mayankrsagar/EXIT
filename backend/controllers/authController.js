// import jwt from 'jsonwebtoken';

// import * as AuthService
//   from '../services/authServices.js'; // renamed userService to AuthService if needed
// import {
//   loginSchema,
//   registerSchema,
// } from '../validators/userValidators.js';

// export const register = async (req, res, next) => {
//   try {
//     const { error, value } = registerSchema.validate(req.body, {
//       abortEarly: false,
//       stripUnknown: true,
//     });
//     if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });
    
//     const { username, email, password, role } = value;
//     const newUser = await AuthService.createUser({ username, email, password, role });
//     return res.status(201).json({ message: 'User registered successfully', data: newUser });
//   } catch (err) {
//     next(err);
//   }
// };

// export const login = async (req, res, next) => {
//   try {
//     const { error, value } = loginSchema.validate(req.body, {
//       abortEarly: false,
//       stripUnknown: true,
//     });
//     if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });

//     const { email, password } = value;
//     const user = await AuthService.findByEmail(email);
//     if (!user) return res.status(401).json({ error: 'Invalid credentials' });

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

//     const payload = { id: user._id, role: user.role };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN || '7d',
//     });
//     return res.status(200).json({ token });
//   } catch (err) {
//     next(err);
//   }
// };


// for crion test 

// backend/controllers/authController.js
import * as authService from '../services/authService.js';

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.registerUser({
      username,
      email, // may be undefined; service will auto‐generate
      password,
    });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.loginUser({ username, email, password });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
