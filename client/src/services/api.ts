import {
  User,
  Complaint,
  ComplaintHistoryItem,
  AIAnalysisRecord,
  Department,
  Hotspot,
  ActionBrief,
  NotificationItem,
  DashboardStats,
} from '../types';

const envApiUrl = (import.meta as any).env?.VITE_API_URL;
const API_BASE = envApiUrl
  ? (envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl.replace(/\/$/, '')}/api`)
  : '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('SmartCivic_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  async register(payload: { name: string; email: string; password: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; token: string; user: User }>(res);
  },

  async login(payload: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; token: string; user: User }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; user: User }>(res);
  },

  // Complaints
  async submitComplaint(formData: FormData) {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    return handleResponse<{ success: boolean; complaint: Complaint }>(res);
  },

  async getMyComplaints() {
    const res = await fetch(`${API_BASE}/complaints/my`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; count: number; complaints: Complaint[] }>(res);
  },

  async getComplaintDetails(id: string) {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{
      success: boolean;
      complaint: Complaint;
      history: ComplaintHistoryItem[];
      aiAnalysis?: AIAnalysisRecord;
      duplicateDetails?: Complaint[];
    }>(res);
  },

  async trackPublic(complaintId: string) {
    const res = await fetch(`${API_BASE}/complaints/track/${complaintId}`);
    return handleResponse<{
      success: boolean;
      complaint: Complaint;
      history: ComplaintHistoryItem[];
    }>(res);
  },

  async updateStatus(id: string, payload: { status: string; remarks?: string; evidenceUrl?: string }) {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; complaint: Complaint }>(res);
  },

  async overridePriority(id: string, payload: { priority: string; reason: string }) {
    const res = await fetch(`${API_BASE}/complaints/${id}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; complaint: Complaint }>(res);
  },

  async assignComplaint(id: string, payload: { departmentId: string; officerId?: string; remarks?: string }) {
    const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; complaint: Complaint }>(res);
  },

  async resolveComplaint(id: string, payload: { remarks: string; resolutionImageUrl?: string }) {
    const res = await fetch(`${API_BASE}/complaints/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; complaint: Complaint }>(res);
  },

  // Admin / Authority
  async getDashboard() {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{
      success: boolean;
      stats: DashboardStats;
      recentComplaints: Complaint[];
    }>(res);
  },

  async getAdminComplaints(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/complaints?${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{
      success: boolean;
      total: number;
      page: number;
      totalPages: number;
      complaints: Complaint[];
    }>(res);
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{
      success: boolean;
      byCategory: Array<{ name: string; count: number }>;
      byPriority: Array<{ priority: string; count: number }>;
      weeklyTrends: Array<{ date: string; day: string; submitted: number; resolved: number }>;
      departmentWorkload: Array<{ name: string; code: string; active: number; resolved: number; total: number }>;
    }>(res);
  },

  async getHotspots() {
    const res = await fetch(`${API_BASE}/admin/hotspots`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; count: number; hotspots: Hotspot[] }>(res);
  },

  async getAIInsights() {
    const res = await fetch(`${API_BASE}/admin/insights`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; count: number; briefs: ActionBrief[] }>(res);
  },

  async getDuplicates() {
    const res = await fetch(`${API_BASE}/admin/duplicates`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; count: number; complaints: Complaint[] }>(res);
  },

  // Departments
  async getDepartments() {
    const res = await fetch(`${API_BASE}/departments`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; count: number; departments: Department[] }>(res);
  },

  async getOfficers() {
    const res = await fetch(`${API_BASE}/departments/officers`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; officers: any[] }>(res);
  },

  async createDepartment(payload: { name: string; code: string; description?: string }) {
    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; department: Department }>(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; unreadCount: number; notifications: NotificationItem[] }>(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // AI Retry / Status
  async retryAIAnalysis(complaintId: string) {
    const res = await fetch(`${API_BASE}/ai/retry/${complaintId}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string; complaint: Complaint; analysis: AIAnalysisRecord }>(res);
  },

  async getAIStatus() {
    const res = await fetch(`${API_BASE}/ai/status`);
    return handleResponse<{
      success: boolean;
      geminiConfigured: boolean;
      model: string;
      mode: string;
      statusMessage: string;
    }>(res);
  },
};

