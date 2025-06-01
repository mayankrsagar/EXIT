// backend/services/exitService.js
import ExitResponse from '../models/ExitResponse.js';
import User from '../models/User.js';

/**
 * Save a set of responses for the current employee.
 *   - employeeId: string
 *   - responses: [ { questionText, response }, ... ]
 */
export const submitExitResponses = async ({ employeeId, responses }) => {
  // Ensure employee exists
  const employee = await User.findById(employeeId);
  if (!employee) {
    const err = new Error('Employee not found');
    err.statusCode = 404;
    throw err;
  }

  // Create new ExitResponse document
  await ExitResponse.create({
    employee: employeeId,
    responses,
  });

  return;
};

/**
 * Get all exit responses (for admin)
 * Returns an array of { employeeId, responses }.
 * We can populate employee if needed, but tests only check responses array.
 */
export const getAllExitResponses = async () => {
  const all = await ExitResponse.find()
    .populate('employee', '_id')
    .select('employee responses -_id');

  // Map to { employeeId, responses }
  return all.map((doc) => ({
    employeeId: doc.employee._id.toString(),
    responses: doc.responses,
  }));
};
