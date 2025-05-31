import * as exitInterviewService from '../services/exitInterviewService.js';
import {
  submitExitInterviewSchema,
} from '../validators/exitInterviewValidators.js';

export const submitExitInterview = async (req, res, next) => {
  try {
    const { error, value } = submitExitInterviewSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });

    const { resignationId, responses } = value;

    // Only Employees whose resignation is approved can submit
    if (req.user.role !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Only employees can submit exit interviews' });
    }

    const newExitInterview = await exitInterviewService.submitExitInterview({
      resignationId,
      employeeId: req.user.id,
      responses,
    });
    return res.status(201).json({ data: newExitInterview });
  } catch (err) {
    next(err);
  }
};

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
