// controllers/resignationController.js

import asyncHandler from 'express-async-handler';

import * as resignationService from '../services/resignationService.js';

/**
 * @desc    Employee submits their resignation
 * @route   POST /api/user/resign
 * @access  Private (EMPLOYEE)
 */
export const submitResignation = asyncHandler(async (req, res) => {
  const { intendedLastWorkingDay, reason } = req.body;

  // 1) Basic payload validation
  if (!intendedLastWorkingDay || !reason) {
    res.status(400);
    throw new Error("`intendedLastWorkingDay` and `reason` are required");
  }

  // 2) Extract employeeId from authenticated user
  const employeeId = req.user.id;

  // 3) Call service layer to do the heavy lifting
  //    - the service will:
  //       • check that the user exists
  //       • parse & validate the date (weekday/holiday)
  //       • create a new Resignation document
  //       • (optionally) send an email to HR
  const newResignation = await resignationService.submitResignation({
    employeeId,
    intendedLastWorkingDay,
    reason
  });

  // 4) Return 201 + the newly created resignation
  return res.status(201).json({
    data: newResignation,
    message: "Resignation submitted successfully"
  });
});

/**
 * @desc    Admin views all resignations
 * @route   GET /api/admin/resignations
 * @access  Private (HR only)
 */
export const getAllResignations = asyncHandler(async (req, res) => {
  // Simply forward to service; no filter ≔ {} by default
  const resignations = await resignationService.getAllResignations();

  return res.status(200).json({
    data: resignations
  });
});

/**
 * @desc    Admin approves/declines a resignation
 * @route   PUT /api/admin/conclude_resignation
 * @access  Private (HR only)
 */
export const concludeResignation = asyncHandler(async (req, res) => {
  const { resignationId, approved, exitDate } = req.body;

  // 1) Basic payload validation
  if (!resignationId || typeof approved !== "boolean") {
  res.status(400);
  throw new Error("`resignationId` and `approved` are required");
}

if (approved && !exitDate) { // ✅ Only required when approving
  res.status(400);
  throw new Error("`exitDate` is required when approving");
}
  

  // 2) Delegate to service layer
  //    - service will:
  //       • look up the resignation
  //       • ensure it's still pending
  //       • validate exitDate against intendedLastWorkingDay
  //       • (optionally) call Calendarific to check for holidays/weekends
  //       • save the updated document
  //       • (optionally) send an email to the employee
  const updatedResignation = await resignationService.concludeResignation({
    resignationId,
    approved,
    exitDate
  });

  // 3) Return 200 + the updated record
  return res.status(200).json({
    data: {
      _id: updatedResignation._id,
      employee: updatedResignation.employee,                    // ObjectId or populated sub‐object
      intendedLastWorkingDay: updatedResignation.intendedLastWorkingDay,
      status: updatedResignation.status,
      exitDate: updatedResignation.exitDate,
      decidedAt: updatedResignation.decidedAt,
      submittedAt: updatedResignation.submittedAt,
      createdAt: updatedResignation.createdAt,
      updatedAt: updatedResignation.updatedAt,
      __v: updatedResignation.__v
    }
  });
});
