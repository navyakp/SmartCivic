import mongoose, { Document, Schema } from 'mongoose';

export interface IAIAnalysis extends Document {
  complaintId: string;
  modelName: string;
  processingStatus: 'SUCCESS' | 'FAILED' | 'PENDING' | 'HEURISTIC';
  category: string;
  summary: string;
  urgency: string;
  impact: string;
  safetyRisk: boolean;
  reasoning: string;
  duplicateResults: Array<{
    complaintId: string;
    similarity: number;
    distanceMeters: number;
    reason: string;
  }>;
  priorityBreakdown: {
    urgency: number;
    safetyImpact: number;
    communityImpact: number;
    geographicCluster: number;
    recurrence: number;
    total: number;
  };
  generatedAt: Date;
  errorMessage?: string;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    complaintId: { type: String, required: true, index: true },
    modelName: { type: String, default: 'gemini-1.5-flash' },
    processingStatus: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING', 'HEURISTIC'],
      default: 'PENDING',
    },
    category: { type: String, default: '' },
    summary: { type: String, default: '' },
    urgency: { type: String, default: 'Medium' },
    impact: { type: String, default: '' },
    safetyRisk: { type: Boolean, default: false },
    reasoning: { type: String, default: '' },
    duplicateResults: [
      {
        complaintId: { type: String },
        similarity: { type: Number },
        distanceMeters: { type: Number },
        reason: { type: String },
      },
    ],
    priorityBreakdown: {
      urgency: { type: Number, default: 0 },
      safetyImpact: { type: Number, default: 0 },
      communityImpact: { type: Number, default: 0 },
      geographicCluster: { type: Number, default: 0 },
      recurrence: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    generatedAt: { type: Date, default: Date.now },
    errorMessage: { type: String },
  },
  { timestamps: false }
);

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);

