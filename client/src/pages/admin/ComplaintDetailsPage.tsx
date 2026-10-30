import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  MapPin,
  Calendar,
  Building2,
  User,
  Brain,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Copy,
  ArrowRight,
  RefreshCw,
  Send,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api';
import {
  Complaint,
  ComplaintHistoryItem,
  AIAnalysisRecord,
  Department,
  ComplaintStatus,
  ComplaintPriority,
} from '../../types';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { CivicMap } from '../../components/CivicMap';
import { useAuth } from '../../contexts/AuthContext';

export const ComplaintDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintHistoryItem[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisRecord | null>(null);
  const [duplicateDetails, setDuplicateDetails] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignmentRemarks, setAssignmentRemarks] = useState('');

  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reopenReason, setReopenReason] = useState('');

  const [overridePriorityVal, setOverridePriorityVal] = useState<ComplaintPriority>('HIGH');
  const [overrideReason, setOverrideReason] = useState('');

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setActionMessage(null);
    try {
      const [res, deptRes, offRes] = await Promise.all([
        api.getComplaintDetails(id),
        api.getDepartments(),
        api.getOfficers(),
      ]);
      setComplaint(res.complaint);
      setHistory(res.history);
      if (res.aiAnalysis) setAiAnalysis(res.aiAnalysis);
      if (res.duplicateDetails) setDuplicateDetails(res.duplicateDetails);
      setDepartments(deptRes.departments);
      setOfficers(offRes.officers || []);

      if (res.complaint.assignedDepartmentId) {
        setSelectedDeptId(res.complaint.assignedDepartmentId._id);
      }
      if (res.complaint.assignedOfficerId) {
        setSelectedOfficerId(res.complaint.assignedOfficerId._id);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to load complaint details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Assignment Handler (Step 4 of demo)
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !selectedDeptId) return;
    setActionLoading(true);
    try {
      await api.assignComplaint(complaint.complaintId, {
        departmentId: selectedDeptId,
        officerId: selectedOfficerId || undefined,
        remarks: assignmentRemarks.trim() || undefined,
      });
      setActionMessage({ type: 'success', text: 'Complaint assigned successfully to department.' });
      await loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to assign complaint.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Status Change Handler
  const handleStatusChange = async (newStatus: ComplaintStatus, remarks?: string) => {
    if (!complaint) return;
    setActionLoading(true);
    try {
      await api.updateStatus(complaint.complaintId, {
        status: newStatus,
        remarks,
      });
      setActionMessage({ type: 'success', text: `Status updated to ${newStatus}.` });
      await loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update status.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Resolve Handler
  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    if (!resolutionRemarks.trim() || resolutionRemarks.trim().length < 5) {
      setActionMessage({ type: 'error', text: 'Detailed resolution remarks are required.' });
      return;
    }
    setActionLoading(true);
    try {
      await api.resolveComplaint(complaint.complaintId, {
        remarks: resolutionRemarks.trim(),
      });
      setActionMessage({ type: 'success', text: 'Complaint marked as RESOLVED and citizen notified.' });
      setResolutionRemarks('');
      await loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to resolve complaint.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Priority Override Handler
  const handlePriorityOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !overrideReason.trim()) {
      setActionMessage({ type: 'error', text: 'Mandatory reason is required for priority override.' });
      return;
    }
    setActionLoading(true);
    try {
      await api.overridePriority(complaint.complaintId, {
        priority: overridePriorityVal,
        reason: overrideReason.trim(),
      });
      setActionMessage({ type: 'success', text: 'Priority override recorded in official audit ledger.' });
      setOverrideReason('');
      await loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to override priority.' });
    } finally {
      setActionLoading(false);
    }
  };

  // AI Re-analyze Handler
  const handleRetryAI = async () => {
    if (!complaint) return;
    setActionLoading(true);
    try {
      const res = await api.retryAIAnalysis(complaint.complaintId);
      setActionMessage({ type: 'success', text: res.message });
      await loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'AI retry failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-[#697786]">
        <div className="w-8 h-8 border-4 border-[#315F80] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading complaint #{id}...</span>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="bg-white p-12 rounded-lg border border-[#DCE2E8] text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-[#B42318] mx-auto" />
        <h2 className="text-lg font-bold text-[#233B53]">Complaint Not Found</h2>
        <p className="text-xs text-[#697786]">The requested reference does not exist in the database.</p>
        <Link to="/admin/complaints" className="text-xs font-semibold text-[#315F80] hover:underline">
          &larr; Return to Complaints Ledger
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#697786]">
            <Link to="/admin/complaints" className="hover:text-[#233B53]">
              Complaints
            </Link>
            <span>/</span>
            <span className="font-mono font-bold text-[#233B53]">{complaint.complaintId}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#233B53] mt-1">{complaint.title}</h1>
        </div>

        <div className="flex items-center space-x-2">
          <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} showScore />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-lg text-xs flex items-center ${
            actionMessage.type === 'success'
              ? 'bg-[#39734D]/10 border border-[#39734D]/30 text-[#39734D]'
              : 'bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318]'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Left Column (Complaint info & AI analysis), Right Column (Workflow & Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: 2 SPANS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Complaint Information */}
          <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm space-y-4">
            <h2 className="font-bold text-sm text-[#233B53] flex items-center justify-between pb-3 border-b border-[#DCE2E8]">
              <span>Citizen Grievance Details</span>
              <span className="font-mono text-xs text-[#697786]">
                Reported {new Date(complaint.createdAt).toLocaleString()}
              </span>
            </h2>

            <div className="text-xs text-[#263442] space-y-2">
              <span className="font-semibold text-[#697786]">Full Citizen Description:</span>
              <p className="bg-[#F4F6F8] p-4 rounded border border-[#DCE2E8] leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Images */}
            {complaint.imageUrls && complaint.imageUrls.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-[#697786] block mb-2">
                  Photographic Evidence:
                </span>
                <div className="flex flex-wrap gap-3">
                  {complaint.imageUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-36 h-28 rounded border border-[#DCE2E8] overflow-hidden group relative block"
                    >
                      <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                        View
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Map Preview */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center text-xs text-[#697786]">
                <MapPin className="w-4 h-4 mr-1 text-[#315F80]" />
                <span className="font-semibold text-[#263442]">{complaint.address}</span>
                <span className="ml-2 font-mono text-[11px]">
                  ({complaint.latitude?.toFixed(5)}, {complaint.longitude?.toFixed(5)})
                </span>
              </div>
              <div className="h-56 w-full rounded border border-[#DCE2E8] overflow-hidden">
                <CivicMap
                  complaints={[complaint]}
                  center={[complaint.latitude, complaint.longitude]}
                  zoom={15}
                  height="100%"
                  showHotspots={false}
                />
              </div>
            </div>
          </div>

          {/* Section 2: AI Intelligence & Priority Breakdown */}
          <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE2E8]">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-[#315F80]" />
                <div>
                  <h3 className="font-bold text-sm text-[#233B53]">AI Complaint Understanding Engine</h3>
                  <span className="text-[11px] text-[#697786]">
                    Processed via {complaint.aiModel} &bull; Status: {complaint.aiStatus}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRetryAI}
                disabled={actionLoading}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#233B53] bg-[#F4F6F8] hover:bg-[#DCE2E8] rounded border border-[#DCE2E8] transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${actionLoading ? 'animate-spin' : ''}`} />
                <span>Re-Analyze</span>
              </button>
            </div>

            {/* Summary & Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#F4F6F8] p-3.5 rounded border border-[#DCE2E8]">
                <span className="font-semibold text-[#697786]">AI Executive Summary:</span>
                <p className="font-medium text-[#233B53] mt-1">"{complaint.aiSummary}"</p>
              </div>

              <div className="bg-[#F4F6F8] p-3.5 rounded border border-[#DCE2E8]">
                <span className="font-semibold text-[#697786]">Public Safety Impact:</span>
                <p className="font-medium text-[#233B53] mt-1">{complaint.aiImpact || 'Standard maintenance impact'}</p>
                <div className="mt-1 flex items-center space-x-1">
                  <span className="text-[11px] text-[#697786]">Safety Hazard Flag:</span>
                  <span className={`text-[11px] font-bold ${complaint.aiSafetyRisk ? 'text-[#B42318]' : 'text-[#39734D]'}`}>
                    {complaint.aiSafetyRisk ? 'YES (High Risk)' : 'NO (Routine)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Explainable Factor Breakdown (0 to 100) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#233B53]">
                  Explainable Priority Score Calculation: {complaint.priorityScore}/100
                </span>
                <PriorityBadge priority={complaint.priority} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono text-xs">
                <div className="bg-[#F4F6F8] p-2.5 rounded border border-[#DCE2E8]">
                  <div className="text-[10px] text-[#697786] uppercase font-sans">Urgency</div>
                  <div className="font-bold text-[#233B53] text-sm mt-0.5">
                    {complaint.priorityBreakdown?.urgency ?? 0}/30
                  </div>
                </div>
                <div className="bg-[#F4F6F8] p-2.5 rounded border border-[#DCE2E8]">
                  <div className="text-[10px] text-[#697786] uppercase font-sans">Safety</div>
                  <div className="font-bold text-[#233B53] text-sm mt-0.5">
                    {complaint.priorityBreakdown?.safetyImpact ?? 0}/25
                  </div>
                </div>
                <div className="bg-[#F4F6F8] p-2.5 rounded border border-[#DCE2E8]">
                  <div className="text-[10px] text-[#697786] uppercase font-sans">Community</div>
                  <div className="font-bold text-[#233B53] text-sm mt-0.5">
                    {complaint.priorityBreakdown?.communityImpact ?? 0}/20
                  </div>
                </div>
                <div className="bg-[#F4F6F8] p-2.5 rounded border border-[#DCE2E8]">
                  <div className="text-[10px] text-[#697786] uppercase font-sans">Cluster</div>
                  <div className="font-bold text-[#233B53] text-sm mt-0.5">
                    {complaint.priorityBreakdown?.geographicCluster ?? 0}/15
                  </div>
                </div>
                <div className="bg-[#F4F6F8] p-2.5 rounded border border-[#DCE2E8]">
                  <div className="text-[10px] text-[#697786] uppercase font-sans">Recurrence</div>
                  <div className="font-bold text-[#233B53] text-sm mt-0.5">
                    {complaint.priorityBreakdown?.recurrence ?? 0}/10
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#697786] bg-[#F4F6F8] p-2.5 rounded border border-[#DCE2E8] leading-relaxed">
                <strong>Scoring Rationale:</strong> {complaint.priorityReasoning}
              </p>
            </div>

            {/* Duplicate Candidates Review Section */}
            {complaint.duplicateCandidates && complaint.duplicateCandidates.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-[#DCE2E8]">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#B58A26]">
                  <Copy className="w-4 h-4" />
                  <span>
                    Duplicate Candidates Detected ({complaint.duplicateCandidates.length} potential matches)
                  </span>
                </div>

                <div className="space-y-2">
                  {complaint.duplicateCandidates.map((dup) => (
                    <div
                      key={dup.complaintId}
                      className="bg-[#F4F6F8] p-3 rounded border border-[#DCE2E8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[#233B53]">
                            #{dup.complaintId}
                          </span>
                          <span className="bg-[#B58A26]/15 text-[#B58A26] px-2 py-0.2 rounded font-bold text-[10px]">
                            {dup.similarity}% Similarity
                          </span>
                          <span className="text-[11px] text-[#697786]">
                            &bull; {dup.distanceMeters}m away
                          </span>
                        </div>
                        <p className="text-[11px] text-[#697786]">{dup.reason}</p>
                      </div>

                      <Link
                        to={`/admin/complaints/${dup.complaintId}`}
                        className="text-xs font-semibold text-[#315F80] hover:underline whitespace-nowrap self-start sm:self-center"
                      >
                        Inspect Match &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Audit Trail History */}
          <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#233B53] pb-3 border-b border-[#DCE2E8]">
              Official Action History Ledger
            </h3>

            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={h._id || i} className="flex items-start space-x-3 text-xs">
                  <div className="mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#315F80]"></div>
                  <div className="flex-1 bg-[#F4F6F8] p-3 rounded border border-[#DCE2E8]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#233B53]">
                        {h.previousStatus} &rarr; <span className="text-[#315F80]">{h.newStatus}</span>
                      </span>
                      <span className="text-[10px] text-[#697786]">
                        {new Date(h.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[#697786] mt-0.5">{h.remarks}</p>
                    {h.changedByName && (
                      <p className="text-[10px] text-[#547D99] mt-0.5">By: {h.changedByName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 1 SPAN (Actions & Workflow) */}
        <div className="space-y-6">
          {/* STEP 4 OF DEMO: Department & Officer Assignment */}
          <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#233B53] flex items-center space-x-2 pb-2 border-b border-[#DCE2E8]">
              <Building2 className="w-4 h-4 text-[#315F80]" />
              <span>Department Assignment</span>
            </h3>

            <form onSubmit={handleAssign} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#263442] mb-1">Select Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full p-2 border border-[#DCE2E8] rounded bg-white text-xs focus:ring-1 focus:ring-[#315F80]"
                >
                  <option value="">-- Choose Municipal Department --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#263442] mb-1">
                  Assign Supervisory Officer (Optional)
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full p-2 border border-[#DCE2E8] rounded bg-white text-xs focus:ring-1 focus:ring-[#315F80]"
                >
                  <option value="">-- Select Officer --</option>
                  {officers.map((off) => (
                    <option key={off._id} value={off._id}>
                      {off.name} ({off.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#263442] mb-1">Assignment Remarks</label>
                <textarea
                  rows={2}
                  value={assignmentRemarks}
                  onChange={(e) => setAssignmentRemarks(e.target.value)}
                  placeholder="e.g. Dispatched for suction clearance and drain desilting..."
                  className="w-full p-2 border border-[#DCE2E8] rounded text-xs focus:ring-1 focus:ring-[#315F80]"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading || !selectedDeptId}
                className="w-full py-2 px-3 bg-[#233B53] hover:bg-[#315F80] text-white font-semibold rounded text-xs transition shadow-sm disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Assign & Advance Status</span>
              </button>
            </form>
          </div>

          {/* Quick Status Advance Workflow */}
          <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#233B53] pb-2 border-b border-[#DCE2E8]">
              Workflow Transitions
            </h3>

            <div className="space-y-2 text-xs">
              <span className="text-[#697786] font-semibold">Advance Operational Stage:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('UNDER_REVIEW', 'Under supervisory technical review.')}
                  disabled={actionLoading || complaint.status === 'UNDER_REVIEW'}
                  className="p-2 text-left bg-[#F4F6F8] hover:bg-[#DCE2E8] rounded border border-[#DCE2E8] font-medium text-[#233B53] disabled:opacity-40"
                >
                  &rarr; Under Review
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('IN_PROGRESS', 'Field crews have arrived on site.')}
                  disabled={actionLoading || complaint.status === 'IN_PROGRESS'}
                  className="p-2 text-left bg-[#C76B19]/10 hover:bg-[#C76B19]/20 rounded border border-[#C76B19]/30 font-medium text-[#C76B19] disabled:opacity-40"
                >
                  &rarr; In Progress
                </button>
              </div>
            </div>

            {/* Resolve Form */}
            <form onSubmit={handleResolve} className="space-y-3 pt-3 border-t border-[#DCE2E8] text-xs">
              <span className="font-bold text-[#39734D] block">Mark as Resolved</span>
              <div>
                <label className="block text-[#697786] mb-1">Mandatory Resolution Notes</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionRemarks}
                  onChange={(e) => setResolutionRemarks(e.target.value)}
                  placeholder="Document work completed (e.g. Suction tanker cleared blocked culvert; road drain flowing smoothly)..."
                  className="w-full p-2 border border-[#DCE2E8] rounded text-xs focus:ring-1 focus:ring-[#39734D]"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading || !resolutionRemarks.trim()}
                className="w-full py-2 px-3 bg-[#39734D] hover:bg-[#2e5e3e] text-white font-semibold rounded text-xs transition shadow-sm disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify & Close Complaint</span>
              </button>
            </form>

            {/* Reject / Reopen options */}
            <div className="pt-3 border-t border-[#DCE2E8] space-y-2 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const reason = prompt('Please enter mandatory reason for REJECTING this complaint:');
                    if (reason && reason.trim()) {
                      handleStatusChange('REJECTED', reason.trim());
                    }
                  }}
                  className="flex-1 py-1.5 px-2 bg-[#B42318]/10 text-[#B42318] hover:bg-[#B42318]/20 rounded border border-[#B42318]/30 font-medium text-center"
                >
                  Reject Complaint
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const reason = prompt('Please enter mandatory reason for REOPENING this complaint:');
                    if (reason && reason.trim()) {
                      handleStatusChange('REOPENED', reason.trim());
                    }
                  }}
                  className="flex-1 py-1.5 px-2 bg-[#C76B19]/10 text-[#C76B19] hover:bg-[#C76B19]/20 rounded border border-[#C76B19]/30 font-medium text-center"
                >
                  Reopen Complaint
                </button>
              </div>
            </div>
          </div>

          {/* Priority Override (Audited) */}
          <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-[#233B53] pb-2 border-b border-[#DCE2E8]">
              Administrative Priority Override
            </h3>
            <p className="text-[11px] text-[#697786]">
              All human overrides require a documented justification stored in the permanent audit ledger.
            </p>

            <form onSubmit={handlePriorityOverride} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#697786] mb-1">New Priority</label>
                <select
                  value={overridePriorityVal}
                  onChange={(e) => setOverridePriorityVal(e.target.value as ComplaintPriority)}
                  className="w-full p-2 border border-[#DCE2E8] rounded bg-white text-xs"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-[#697786] mb-1">Mandatory Justification</label>
                <textarea
                  rows={2}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Emergency hospital corridor; manual elevation required..."
                  className="w-full p-2 border border-[#DCE2E8] rounded text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading || !overrideReason.trim()}
                className="w-full py-1.5 px-3 bg-[#F4F6F8] hover:bg-[#DCE2E8] text-[#233B53] font-semibold rounded text-xs border border-[#DCE2E8] transition disabled:opacity-50"
              >
                Record Priority Override
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
