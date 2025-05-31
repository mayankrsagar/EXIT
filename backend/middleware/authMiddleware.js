// // middleware/authMiddleware.js
// import jwt from 'jsonwebtoken';

// import User from '../models/User.js';

// /**
//  * Protect middleware
//  * - Expects: Authorization: Bearer <token>
//  * - Verifies the token, finds the user, and sets req.user = { id, role }
//  * - If no token / invalid token / user not found, returns 401
//  */
// export const protect = async (req, res, next) => {
//   let token;

//   // 1. Grab token from Authorization header
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer ')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   if (!token) {
//     return res
//       .status(401)
//       .json({ error: 'Not authorized, token missing' });
//   }

//   try {
//     // 2. Verify token and decode payload
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // decoded should have at least { id, role, iat, exp }

//     // 3. Fetch user from DB (to confirm it still exists)
//     const user = await User.findById(decoded.id).select('-password');
//     if (!user) {
//       return res
//         .status(401)
//         .json({ error: 'Not authorized, user not found' });
//     }

//     // 4. Attach user info to req.user for downstream use
//     req.user = { id: user._id.toString(), role: user.role };
//     next();
//   } catch (err) {
//     console.error('authMiddleware.protect error:', err);
//     return res
//       .status(401)
//       .json({ error: 'Not authorized, token invalid or expired' });
//   }
// };


// for crio test 

// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Protect routes—extract token from "Authorization" header.
 * Accepts either:
 *    Authorization: "<token>" 
 *  or
 *    Authorization: "Bearer <token>"
 */
export const protect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization) {
    const header = req.headers.authorization;
    if (header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    } else {
      token = header;
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized, token invalid' });
  }
};

/**
 * Allow only HRs to proceed
 */
export const hrOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'HR') {
    return res
      .status(403)
      .json({ error: 'Access denied: HR only resource' });
  }
  next();
};
