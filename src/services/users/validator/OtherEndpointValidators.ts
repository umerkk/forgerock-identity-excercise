import { checkSchema } from 'express-validator';

/**
 * Schema validators for the incoming HTTP requests.
 */
export const loginValidator = checkSchema({
  username: {
    in: ['body'],
    notEmpty: true,
    exists: true,
    isEmail: true,
    errorMessage: 'Email must be specified & valid',
  },
  password: {
    in: ['body'],
    notEmpty: true,
    exists: true,
    errorMessage: 'Password must be specified & valid',
  },
});
