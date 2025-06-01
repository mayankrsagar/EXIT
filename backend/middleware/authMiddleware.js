// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';

/**
 * protect: checks for "Authorization: Bearer <token>" header,
 * verifies the JWT, and attaches `req.user = { id, role, ... }`
 */
export const protect = async (req, res, next) => {
  let token;

  // Expect header in form "Authorization: Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Optionally, rehydrate the user from DB if you want to attach full user info
      // const dbUser = await User.findById(decoded.id).select('-password');
      // req.user = dbUser;
      req.user = { id: decoded.id, role: decoded.role };

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Not authorized, token invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, token missing' });
  }
};

/**
 * hrOnly: after `protect` has run, checks that req.user.role === "HR"
 */
export const hrOnly = (req, res, next) => {
  if (req.user && req.user.role === 'HR') {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden: HRs only' });
  }
};
