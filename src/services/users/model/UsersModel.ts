import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../types/User';
import { Roles } from '../types/Roles';
import Logger from '../../../utils/Logger';

/**
 * Mongoose Schema with default validations.
 */
const usersSchema = new Schema<User>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Roles, required: true, default: Roles.USER },
  manager: { type: Schema.Types.ObjectId, required: false, ref: 'Users' },
  createdAt: { type: Date, required: false },
  updatedAt: { type: Date, required: false },
});

usersSchema.pre('save', async function (next) {
  const user = this as User;

  // Do not modify password if it is not modified
  if (!user.isModified('password')) {
    return next();
  }

  // Calculate & add createdAt and updatedAt fields on each write.
  if (user.isNew) {
    user.createdAt = new Date();
  } else {
    user.updatedAt = new Date();
  }

  // Hash password
  try {
    const hash = await hashPassword(user.password);
    user.password = hash;
    next();
  } catch (err: any) {
    Logger.error(err);
    next(err);
  }
});

/**
 * Virtual Fields
 */

usersSchema.virtual('directReports', {
  ref: ' Users',
  localField: '_id',
  foreignField: 'manager',
  justOne: false,
});
usersSchema.set('toJSON', { virtuals: true });

/**
 * Schema Methods
 */

usersSchema.methods.verifyPassword = function (candidatePassword): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Private D.R.Y functions
 */
async function hashPassword(plainPassword: string): Promise<string> {
  const BCRYPT_SALT_ROUNDS = 12;

  // Hash password
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  const hash = await bcrypt.hash(plainPassword, salt);
  return hash;
}

export default model<User>('Users', usersSchema);
