// validators/userValidators.js
import Joi from 'joi';

/**
 * Validate request body for registering a new user.
 * Fields:
 *  - username: required, string, 3–30 chars, alphanumeric + underscores
 *  - password: required, string, minimum 6 chars
 *  - role: optional, either 'HR' or 'Employee' (default 'Employee')
 */

export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base':   `"username" should be a type of 'text'`,
      'string.empty':  `"username" cannot be an empty field`,
      'string.min':    `"username" should have at least {#limit} characters`,
      'string.max':    `"username" should have at most {#limit} characters`,
      'any.required':  `"username" is required`,
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(254)    // RFC limit for email addresses is 254 chars
    .required()
    .messages({
      'string.base':   `"email" should be a type of 'text'`,
      'string.email':  `"email" must be a valid email address`,
      'string.empty':  `"email" cannot be an empty field`,
      'string.max':    `"email" should have at most {#limit} characters`,
      'any.required':  `"email" is required`,
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.base':   `"password" should be a type of 'text'`,
      'string.empty':  `"password" cannot be an empty field`,
      'string.min':    `"password" should have at least {#limit} characters`,
      'any.required':  `"password" is required`,
    }),

  role: Joi.string()
    .valid('HR', 'EMPLOYEE')
    .default('EMPLOYEE')
    .messages({
      'any.only': `"role" must be one of [HR, EMPLOYEE]`,
    }),
});


/**
 * Validate request body for logging in a user (HR or Employee).
 * Fields:
 *  - username: required, string
 *  - password: required, string
 */

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base':   `"email" should be a type of 'text'`,
      'string.email':  `"email" must be a valid email address`,
      'string.empty':  `"email" cannot be an empty field`,
      'any.required':  `"email" is required`,
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.base':   `"password" should be a type of 'text'`,
      'string.empty':  `"password" cannot be an empty field"`,
      'any.required':  `"password" is required"`,
    }),
});

