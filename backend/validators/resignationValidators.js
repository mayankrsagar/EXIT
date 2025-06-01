// validators/resignationValidators.js
import Joi from 'joi';

/**
 * Validate request body when an Employee submits a resignation.
 * Fields:
 *  - intendedLastWorkingDay: required, ISO date string (YYYY-MM-DD), cannot be in the past
 *  - reason: optional, string, up to 1000 characters
 *
 * Note: You should still check weekends/holidays (via Calendarific) in your service/controller logic.
 */
export const submitResignationSchema = Joi.object({
  intendedLastWorkingDay: Joi.date()
    .iso()
    .greater('now')
    .required()
    .messages({
      'date.base': `"intendedLastWorkingDay" should be a valid ISO date`,
      'date.format': `"intendedLastWorkingDay" must be in ISO format (YYYY-MM-DD)`,
      'date.greater': `"intendedLastWorkingDay" must be a future date`,
      'any.required': `"intendedLastWorkingDay" is required`,
    }),

  reason: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.base': `"reason" should be a type of 'text'`,
      'string.max': `"reason" cannot exceed {#limit} characters`,
    }),
});

/**
 * Validate request body when HR approves or rejects a resignation.
 * Fields:
 *  - resignationId: required, 24‐character hex string (MongoDB ObjectId)
 *  - approved: required, boolean
 *  - exitDate: required if approved === true, must be an ISO date (YYYY-MM-DD) >= today
 *
 * Note: You should still verify in your service logic that exitDate >= intendedLastWorkingDay, 
 * and also that it’s not a weekend/holiday.
 */
export const concludeResignationSchema = Joi.object({
  resignationId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.base': `"resignationId" should be a type of 'text'`,
      'string.hex': `"resignationId" must be a valid hex string`,
      'string.length': `"resignationId" must be {#limit} characters long`,
      'any.required': `"resignationId" is required`,
    }),

  approved: Joi.boolean()
    .required()
    .messages({
      'boolean.base': `"approved" should be true or false`,
      'any.required': `"approved" is required`,
    }),

  exitDate: Joi.when('approved', {
    is: true,
    then: Joi.date()
      .iso()
      .greater('now')
      .required()
      .messages({
        'date.base': `"exitDate" should be a valid ISO date`,
        'date.format': `"exitDate" must be in ISO format (YYYY-MM-DD)`,
        'date.greater': `"exitDate" must be a future date`,
        'any.required': `"exitDate" is required when approved is true`,
      }),
    otherwise: Joi.forbidden().messages({
      'any.unknown': `"exitDate" is not allowed when approved is false`,
    }),
  }),
});
