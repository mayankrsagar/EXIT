import * as exitInterviewService from '../services/exitInterviewService.js';
import {
  submitExitInterviewSchema,
} from '../validators/exitInterviewValidators.js';

/**
 * POST /api/user/responses
 * Body: { responses: [ { questionText, response }, ... ] }
 */
export const submitExitInterview = async (req, res, next) => {
  try {
    // 1) Validate incoming request
    const { error, value } = submitExitInterviewSchema.validate(req.body, {
      abortEarly:   false,
      stripUnknown: true,
    });
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map(d => d.message) });
    }

    const { resignationId, responses } = value;

    // 2) Only employees can hit this endpoint
    if (req.user.role !== "EMPLOYEE") {
      return res
        .status(403)
        .json({ error: "Only employees can submit exit interviews" });
    }

    // 3) Call the service layer to create & save the exit interview
    const newExitInterview = await exitInterviewService.submitExitInterview({
      resignationId,
      employeeId: req.user.id,
      responses,
    });

    // 4) Return a JSON body with both `message` and `data: newExitInterview`
   return res.status(201).json({
    message: "Exit interview submitted",
    data:    newExitInterview,
  });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/exit_responses
 */
export const getAllExitInterviews = async (req, res, next) => {
  try {
    // Only HR can view all exit interviews
    if (req.user.role !== 'HR') {
      return res.status(403).json({ error: 'Only HR can view exit interviews' });
    }

    const interviews = await exitInterviewService.getAllExitInterviews();
    return res.status(200).json({ data: interviews });
  } catch (err) {
    next(err);
  }
};
