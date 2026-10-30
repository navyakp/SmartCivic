export type UserRole = 'citizen' | 'admin' | 'officer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  departmentId?: string;
  createdAt?: string;
}

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'REOPENED';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PriorityBreakdown {
  urgency: number;
  safetyImpact: number;
  communityImpact: number;
  geographicCluster: number;
  recurrence: number;
  total?: number;
}

export interface DuplicateCandidate {
  complaintId: string;
  similarity: number;
  distanceMeters: number;
  reason: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  officerIds: Array<{ _id: string; name: string; email: string; phone?: string; role: string }>;
  activeCount?: number;
  resolvedCount?: number;
}

export interface Complaint {
  _id: string;
  complaintId: string;
  citizenId: string;
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
  priorityBreakdown: PriorityBreakdown;
  priorityReasoning: string;
  priorityOverride?: {
    overriddenBy: { _id: string; name: string; role: string };
    previousPriority: ComplaintPriority;
    newPriority: ComplaintPriority;
    reason: string;
    overriddenAt: string;
  };
  aiSummary: string;
  aiCategory: string;
  aiUrgency: string;
  aiImpact: string;
  aiSafetyRisk: boolean;
  aiStatus: 'SUCCESS' | 'FAILED' | 'PENDING' | 'HEURISTIC';
  aiModel: string;
  duplicateCandidates: DuplicateCandidate[];
  assignedDepartmentId?: Department;
  assignedOfficerId?: { _id: string; name: string; email: string; phone?: string; role: string };
  assignedAt?: string;
  assignmentRemarks?: string;
  resolutionRemarks?: string;
  resolutionImageUrl?: string;
  resolvedAt?: string;
  rejectionReason?: string;
  reopenReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintHistoryItem {
  _id: string;
  complaintId: string;
  changedBy: string;
  changedByName?: string;
  previousStatus: string;
  newStatus: string;
  remarks: string;
  evidenceUrl?: string;
  timestamp: string;
}

export interface AIAnalysisRecord {
  complaintId: string;
  modelName: string;
  processingStatus: string;
  category: string;
  summary: string;
  urgency: string;
  impact: string;
  safetyRisk: boolean;
  reasoning: string;
  duplicateResults: DuplicateCandidate[];
  priorityBreakdown: PriorityBreakdown & { total: number };
  generatedAt: string;
}

export interface Hotspot {
  id: string;
  center: { lat: number; lng: number };
  radius: number;
  complaintCount: number;
  averagePriorityScore: number;
  priorityLevel: ComplaintPriority;
  categories: string[];
  topCategory: string;
  primaryAddress: string;
  complaints: Array<{
    complaintId: string;
    title: string;
    category: string;
    priority: ComplaintPriority;
    score: number;
    status: ComplaintStatus;
    latitude: number;
    longitude: number;
    createdAt: string;
  }>;
  recommendedAction: string;
}

export interface ActionBrief {
  briefId: string;
  headline: string;
  locationArea: string;
  category: string;
  complaintCount: number;
  priorityLevel: ComplaintPriority;
  averageScore: number;
  potentialImpact: string;
  suggestedDepartment: string;
  recommendedNextSteps: string[];
  complaintIds: string[];
  generatedAt: string;
  disclaimer: string;
}

export interface NotificationItem {
  _id: string;
  recipientId: string;
  complaintId?: string;
  title: string;
  message: string;
  type: 'STATUS_UPDATE' | 'NEW_ASSIGNMENT' | 'CRITICAL_ALERT' | 'DUPLICATE_ALERT' | 'HOTSPOT_ALERT' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  critical: number;
  inProgress: number;
  resolved: number;
  avgResolutionHours: number;
}
