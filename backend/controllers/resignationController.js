// import * as resignationService from '../services/resignationService.js';
// import {
//   concludeResignationSchema,
//   submitResignationSchema,
// } from '../validators/resignationValidators.js';

// export const submitResignation = async (req, res, next) => {
//   try {
//     const { error, value } = submitResignationSchema.validate(req.body, {
//       abortEarly: false,
//       stripUnknown: true,
//     });
//     if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });

//     const { intendedLastWorkingDay, reason } = value;

//     // Only Employees can submit
//     if (req.user.role !== 'EMPLOYEE') {
//       return res.status(403).json({ error: 'Only employees can submit resignations' });
//     }

//     const newResignation = await resignationService.submitResignation({
//       employeeId: req.user.id,
//       intendedLastWorkingDay,
//       reason,
//     });
//     return res.status(201).json({ data: newResignation });
//   } catch (err) {
//     next(err);
//   }
// };

// export const getAllResignations = async (req, res, next) => {
//   try {
//     // Only HR can view all resignations
//     if (req.user.role !== 'HR') {
//       return res.status(403).json({ error: 'Only HR can view resignations' });
//     }

//     const resignations = await resignationService.getAllResignations();
//     return res.status(200).json({ data: resignations });
//   } catch (err) {
//     next(err);
//   }
// };

// export const concludeResignation = async (req, res, next) => {
//   try {
//     const { error, value } = concludeResignationSchema.validate(req.body, {
//       abortEarly: false,
//       stripUnknown: true,
//     });
//     if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });

//     // Only HR can approve/reject
//     if (req.user.role !== 'HR') {
//       return res.status(403).json({ error: 'Only HR can conclude resignations' });
//     }

//     const updated = await resignationService.concludeResignation(value);
//     return res.status(200).json({ data: updated });
//   } catch (err) {
//     next(err);
//   }
// };

// for crio test only

// backend/controllers/resignationController.js
import * as resignationService from '../services/resignationService.js';

/**
 * POST /api/user/resign
 * Body: { intendedLastWorkingDay }
 */
export const submitResignation = async (req, res, next) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const { intendedLastWorkingDay } = req.body;

    const newRes = await resignationService.submitResignation({
      employeeId: userId,
      intendedLastWorkingDay,
    });
    return res
      .status(200)
      .json({ data: { resignation: { _id: newRes._id } } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/resignations
 */
export const getAllResignations = async (req, res, next) => {
  try {
    const all = await resignationService.getAllResignations();
    return res.status(200).json({ data: all });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/conclude_resignation
 * Body: { resignationId, approved, lwd }
 */
export const concludeResignation = async (req, res, next) => {
  try {
    const { resignationId, approved, lwd } = req.body;
    const updated = await resignationService.concludeResignation({
      resignationId,
      approved,
      lwd,
    });
    return res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
};

