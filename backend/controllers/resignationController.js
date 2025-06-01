// controllers/resignationController.js

import asyncHandler from 'express-async-handler';

import Resignation from '../models/Resignation.js';
import User from '../models/User.js';

// @desc    Employee submits their resignation
// @route   POST /api/user/resign
// @access  Private (employee)
export const submitResignation = asyncHandler(async (req, res) => {
  // Now we read `intendedLastWorkingDay` from the request body
  const { intendedLastWorkingDay } = req.body;
  if (!intendedLastWorkingDay) {
    res.status(400);
    throw new Error("intendedLastWorkingDay is required");
  }

  // Look up the authenticated user
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Create a new Resignation document
  const resignation = await Resignation.create({
    user: userId,
    lastWorkingDay: new Date(intendedLastWorkingDay),
    status: "Pending",
    // …any other fields you need…
  });

  return res.status(200).json({
    data: { resignation },
    message: "Resignation submitted successfully",
  });
});

// @desc    Admin views all resignations
// @route   GET /api/admin/resignations
// @access  Private (hrOnly)
export const getAllResignations = asyncHandler(async (req, res) => {
  const resignations = await Resignation.find({})
    .populate("user", "username email role")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    data: resignations,
  });
});

// @desc    Admin approves/declines a resignation
// @route   PUT /api/admin/conclude_resignation
// @access  Private (hrOnly)
// controllers/resignationController.js

export const concludeResignation = asyncHandler(async (req, res) => {
  const { resignationId, approved, intendedLastWorkingDay, exitDate } = req.body;

  if (!resignationId || typeof approved !== "boolean" || !intendedLastWorkingDay || !exitDate) {
    res.status(400);
    throw new Error("resignationId, approved (boolean), intendedLastWorkingDay and exitDate are all required");
  }

  const resignation = await Resignation.findById(resignationId);
  if (!resignation) {
    res.status(404);
    throw new Error("Resignation not found");
  }

  resignation.status = approved ? "Approved" : "Declined";
  resignation.intendedLastWorkingDay = new Date(intendedLastWorkingDay);
  resignation.exitDate = new Date(exitDate);
  resignation.decidedAt = new Date();

  const updated = await resignation.save();
  return res.status(200).json({
    data: {
      _id: updated._id,
      employee: {
        _id: updated.user,
        username: updated.employeeUsername,
        email: updated.employeeEmail,
      },
      intendedLastWorkingDay: updated.intendedLastWorkingDay,
      status: updated.status,
      exitDate: updated.exitDate,
      decidedAt: updated.decidedAt,
      submittedAt: updated.submittedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      __v: updated.__v,
    },
  });
});

