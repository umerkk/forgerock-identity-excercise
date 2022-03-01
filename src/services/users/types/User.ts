import { Document, Types } from 'mongoose';
import { Roles } from './Roles';

export default interface User extends Document {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Roles;
  manager: Types.ObjectId | User;
  directReports: [User];
  createdAt: Date;
  updatedAt: Date;

  verifyPassword: (candidatePassword: string) => Promise<boolean>;
}
