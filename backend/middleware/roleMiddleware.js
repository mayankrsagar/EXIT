// middleware/roleMiddleware.js

/**
 * Only allow users whose role === 'EMPLOYEE'
 */
export const employeeOnly = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ error: 'Not authorized, no user information' });
  }
  if (req.user.role !== 'EMPLOYEE') {
    return res
      .status(403)
      .json({ error: 'Forbidden: Employees only' });
  }
  next();
};

/**
 * Only allow users whose role === 'HR'
 */
export const hrOnly = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ error: 'Not authorized, no user information' });
  }
  if (req.user.role !== 'HR') {
    return res
      .status(403)
      .json({ error: 'Forbidden: HRs only' });
  }
  next();
};
