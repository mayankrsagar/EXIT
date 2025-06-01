// validators/exitInterviewValidators.js
import Joi from 'joi';

/**
 * Each question/response pair:
 *  - questionText: required, non-empty string
 *  - response: required, non-empty string
 */
const questionResponseSchema = Joi.object({
  questionText: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': `"questionText" should be a type of 'text'`,
      'string.empty': `"questionText" cannot be empty`,
      'any.required': `"questionText" is required`,
    }),

  response: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': `"response" should be a type of 'text'`,
      'string.empty': `"response" cannot be empty`,
      'any.required': `"response" is required`,
    }),
});

/**
 * Validate request body when an Employee submits an exit interview.
 * Fields:
 *  - resignationId: required, 24-character hex (MongoDB ObjectId)
 *  - responses: required, array of questionResponseSchema, at least one element
 */
export const submitExitInterviewSchema = Joi.object({
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

  responses: Joi.array()
    .items(questionResponseSchema)
    .min(1)
    .required()
    .messages({
      'array.base': `"responses" should be an array of question/response objects`,
      'array.min': `"responses" must contain at least {#limit} item`,
      'any.required': `"responses" is required`,
    }),
});
