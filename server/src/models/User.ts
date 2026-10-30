import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'citizen' | 'admin' | 'officer';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  departmentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['citizen', 'admin', 'officer'], default: 'citizen', index: true },
    phone: { type: String, trim: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

