// backend/controllers/exitController.js
import * as exitService from '../services/exitService.js';

/**
 * POST /api/user/responses
 * Body: { responses: [ { questionText, response }, ... ] }
 */
export const submitExitInterview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { responses } = req.body;
    await exitService.submitExitResponses({ employeeId: userId, responses });
    return res.status(200).json({ message: 'Exit interview submitted' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/exit_responses
 */
export const getAllExitInterviews = async (req, res, next) => {
  try {
    const all = await exitService.getAllExitResponses();
    return res.status(200).json({ data: all });
  } catch (err) {
    next(err);
  }
};
