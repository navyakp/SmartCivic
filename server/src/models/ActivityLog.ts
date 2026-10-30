import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivityLog extends Document {
  userId: Types.ObjectId;
  userName?: string;
  userRole?: string;
  action: string;
  entityType: 'COMPLAINT' | 'USER' | 'DEPARTMENT' | 'AI' | 'SYSTEM';
  entityId: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String },
    userRole: { type: String },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['COMPLAINT', 'USER', 'DEPARTMENT', 'AI', 'SYSTEM'],
      required: true,
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ActivityLogSchema.index({ timestamp: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

