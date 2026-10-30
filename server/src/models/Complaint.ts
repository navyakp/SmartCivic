import mongoose, { Document, Schema, Types } from 'mongoose';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'REOPENED';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IPriorityBreakdown {
  urgency: number; // 0-30
  safetyImpact: number; // 0-25
  communityImpact: number; // 0-20
  geographicCluster: number; // 0-15
  recurrence: number; // 0-10
}

export interface IDuplicateCandidate {
  complaintId: string;
  similarity: number;
  distanceMeters: number;
  reason: string;
}

export interface IComplaint extends Document {
  complaintId: string;
  citizenId: Types.ObjectId;
  citizenName?: string;
  citizenEmail?: string;
  title: string;
  description: string;
  category: string;
  imageUrls: string[];
  address: string;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  priorityScore: number;
  priorityBreakdown: IPriorityBreakdown;
  priorityReasoning: string;
  priorityOverride?: {
    overriddenBy: Types.ObjectId;
    previousPriority: ComplaintPriority;
    newPriority: ComplaintPriority;
    reason: string;
    overriddenAt: Date;
  };
  aiSummary: string;
  aiCategory: string;
  aiUrgency: string;
  aiImpact: string;
  aiSafetyRisk: boolean;
  aiStatus: 'SUCCESS' | 'FAILED' | 'PENDING' | 'HEURISTIC';
  aiModel: string;
  duplicateCandidates: IDuplicateCandidate[];
  assignedDepartmentId?: Types.ObjectId;
  assignedOfficerId?: Types.ObjectId;
  assignedAt?: Date;
  assignmentRemarks?: string;
  resolutionRemarks?: string;
  resolutionImageUrl?: string;
  resolvedAt?: Date;
  rejectionReason?: string;
  reopenReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    citizenName: { type: String },
    citizenEmail: { type: String },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    imageUrls: [{ type: String }],
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'REOPENED'],
      default: 'SUBMITTED',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    priorityScore: { type: Number, default: 50 },
    priorityBreakdown: {
      urgency: { type: Number, default: 15 },
      safetyImpact: { type: Number, default: 12 },
      communityImpact: { type: Number, default: 10 },
      geographicCluster: { type: Number, default: 7 },
      recurrence: { type: Number, default: 5 },
    },
    priorityReasoning: { type: String, default: '' },
    priorityOverride: {
      overriddenBy: { type: Schema.Types.ObjectId, ref: 'User' },
      previousPriority: { type: String },
      newPriority: { type: String },
      reason: { type: String },
      overriddenAt: { type: Date },
    },
    aiSummary: { type: String, default: '' },
    aiCategory: { type: String, default: '' },
    aiUrgency: { type: String, default: 'Medium' },
    aiImpact: { type: String, default: '' },
    aiSafetyRisk: { type: Boolean, default: false },
    aiStatus: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING', 'HEURISTIC'],
      default: 'PENDING',
    },
    aiModel: { type: String, default: 'local-heuristic' },
    duplicateCandidates: [
      {
        complaintId: { type: String },
        similarity: { type: Number },
        distanceMeters: { type: Number },
        reason: { type: String },
      },
    ],
    assignedDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    assignedOfficerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedAt: { type: Date },
    assignmentRemarks: { type: String },
    resolutionRemarks: { type: String },
    resolutionImageUrl: { type: String },
    resolvedAt: { type: Date },
    rejectionReason: { type: String },
    reopenReason: { type: String },
  },
  { timestamps: true }
);

ComplaintSchema.index({ latitude: 1, longitude: 1 });
ComplaintSchema.index({ createdAt: -1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);

