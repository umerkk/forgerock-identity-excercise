import { checkSchema } from 'express-validator';
import { isValidObjectId } from 'mongoose';
import { Roles } from '../types/Roles';

/**
 * Schema validators for the incoming HTTP requests.
 */
export const addUserValidator = checkSchema({
  firstName: {
    in: ['body'],
    notEmpty: true,
    exists: true,
    trim: true,
    escape: true,
    errorMessage: 'First name must be specified & valid',
  },
  lastName: {
    in: ['body'],
    notEmpty: true,
    exists: true,
    trim: true,
    escape: true,
    errorMessage: 'Last name must be specified & valid',
  },
  email: {
    in: ['body'],
    notEmpty: true,
    isEmail: true,
    exists: true,
    normalizeEmail: true,
    trim: true,
    escape: true,
    errorMessage: 'Email must be specified & valid',
  },
  password: {
    in: ['body'],
    notEmpty: true,
    exists: true,
    errorMessage: 'First name must be specified & valid',
  },
  role: {
    in: ['body'],
    notEmpty: true,
    exists: true,
    trim: true,
    escape: true,
    isIn: {
      options: [[Roles.ADMIN, Roles.USER]],
      errorMessage: 'Role must be specified & valid',
    },
  },
  manager: {
    in: ['body'],
    notEmpty: true,
    exists: true,
    trim: true,
    escape: true,
    custom: {
      options: (value) => isValidObjectId(value),
    },
    errorMessage: 'Manager ID must be specified & valid',
  },
});
