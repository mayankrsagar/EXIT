// services/exitInterviewService.js
import ExitInterview from '../models/ExitInterview.js';
import Resignation from '../models/Resignation.js';

/**
 * Submit an exit interview response.
 * Steps:
 * 1. Verify that the referenced Resignation exists and is in 'Approved' status
 * 2. Verify that the employee matches the resignation.employee
 * 3. Create & save the ExitInterview document
 * 4. Return the saved document
 */
export const submitExitInterview = async ({ resignationId, employeeId, responses }) => {
  // 1. Check that Resignation exists
  const resignation = await Resignation.findById(resignationId);
  if (!resignation) {
    const err = new Error('Resignation not found');
    err.statusCode = 404;
    throw err;
  }

  // 2. Only approved resignations may submit exit interviews
  if (resignation.status !== 'Approved') {
    const err = new Error('Exit interview may only be submitted after resignation is approved');
    err.statusCode = 400;
    throw err;
  }

  // 3. Ensure the logged-in employee matches the resignation.employee
  if (resignation.employee.toString() !== employeeId) {
    const err = new Error('You are not authorized to submit exit interview for this resignation');
    err.statusCode = 403;
    throw err;
  }

  // 4. Create & save
  const newExitInterview = await ExitInterview.create({
    resignation: resignationId,
    employee: employeeId,
    responses, // array of { questionText, response }
    submittedAt: new Date(),
  });

  return newExitInterview;
};

/**
 * Fetch all exit interviews for HR review.
 * - Optionally, filter by: { employee: someEmployeeId } or { resignation: someResignationId }
 * Returns an array of ExitInterview documents populated with `employee` and `resignation`.
 */
export const getAllExitInterviews = async (filter = {}) => {
  return await ExitInterview.find(filter)
    .populate({ path: 'employee', select: 'username email' })
    .populate({
      path: 'resignation',
      select: 'intendedLastWorkingDay exitDate status',
    });
};

/**
 * Fetch a single exit interview by its ID.
 * Returns the ExitInterview document (populated) or null if not found.
 */
export const getExitInterviewById = async (id) => {
  const exitInterview = await ExitInterview.findById(id)
    .populate({ path: 'employee', select: 'username email' })
    .populate({ path: 'resignation', select: 'intendedLastWorkingDay exitDate status' });

  return exitInterview;
};
