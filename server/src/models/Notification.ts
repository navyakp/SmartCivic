import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  complaintId?: string;
  title: string;
  message: string;
  type: 'STATUS_UPDATE' | 'NEW_ASSIGNMENT' | 'CRITICAL_ALERT' | 'DUPLICATE_ALERT' | 'HOTSPOT_ALERT' | 'SYSTEM';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    complaintId: { type: String, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['STATUS_UPDATE', 'NEW_ASSIGNMENT', 'CRITICAL_ALERT', 'DUPLICATE_ALERT', 'HOTSPOT_ALERT', 'SYSTEM'],
      default: 'STATUS_UPDATE',
    },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

NotificationSchema.index({ recipientId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

