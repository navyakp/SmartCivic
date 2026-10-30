import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComplaintHistory extends Document {
  complaintId: string;
  changedBy: Types.ObjectId;
  changedByName?: string;
  previousStatus: string;
  newStatus: string;
  remarks: string;
  evidenceUrl?: string;
  timestamp: Date;
}

const ComplaintHistorySchema = new Schema<IComplaintHistory>(
  {
    complaintId: { type: String, required: true, index: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedByName: { type: String },
    previousStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    remarks: { type: String, default: '' },
    evidenceUrl: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const ComplaintHistory = mongoose.model<IComplaintHistory>(
  'ComplaintHistory',
  ComplaintHistorySchema
);

