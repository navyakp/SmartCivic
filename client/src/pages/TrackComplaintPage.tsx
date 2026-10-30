import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Building2,
  Calendar,
  FileText,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { Complaint, ComplaintHistoryItem } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';

export const TrackComplaintPage: React.FC = () => {
  const { complaintId: routeId } = useParams<{ complaintId?: string }>();
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState(routeId || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaint = async (id: string) => {
    if (!id || !id.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.trackPublic(id.trim());
      setComplaint(res.complaint);
      setHistory(res.history);
    } catch (err: any) {
      setError(err.message || 'Complaint reference not found.');
      setComplaint(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeId) {
      setInputVal(routeId);
      fetchComplaint(routeId);
    }
  }, [routeId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    navigate(`/track/${inputVal.trim().toUpperCase()}`);
    fetchComplaint(inputVal.trim().toUpperCase());
  };

  const workflowSteps = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const order = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (currentStatus === 'REJECTED') return stepKey === 'SUBMITTED' ? 'complete' : 'rejected';
    if (currentIndex === -1) return 'pending';
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6 py-8">
      {/* Search Header */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#DCE2E8] shadow-sm space-y-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
            Public Transparency Registry
          </span>
          <h1 className="text-2xl font-bold text-[#233B53] mt-0.5">
            Track Grievance Resolution Status
          </h1>
          <p className="text-xs text-[#697786] mt-1">
            Enter your unique complaint reference ID (e.g. <code>CP-2026-00001</code>) to inspect live field actions.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#697786]" />
            <input
              type="text"
              required
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. CP-2026-00001"
              className="w-full pl-9 pr-3 py-2.5 border border-[#DCE2E8] rounded-md text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#233B53] hover:bg-[#315F80] rounded-md transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Quick Demo Links */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#697786] pt-1">
          <span className="font-semibold text-[11px]">Sample Records:</span>
          <button
            type="button"
            onClick={() => {
              setInputVal('CP-2026-00001');
              navigate('/track/CP-2026-00001');
              fetchComplaint('CP-2026-00001');
            }}
            className="text-[11px] font-mono text-[#315F80] hover:underline bg-[#F4F6F8] px-2 py-0.5 rounded border border-[#DCE2E8]"
          >
            CP-2026-00001 (Waterlogging)
          </button>
          <button
            type="button"
            onClick={() => {
              setInputVal('CP-2026-00006');
              navigate('/track/CP-2026-00006');
              fetchComplaint('CP-2026-00006');
            }}
            className="text-[11px] font-mono text-[#315F80] hover:underline bg-[#F4F6F8] px-2 py-0.5 rounded border border-[#DCE2E8]"
          >
            CP-2026-00006 (Tech Park Potholes)
          </button>
          <button
            type="button"
            onClick={() => {
              setInputVal('CP-2026-00016');
              navigate('/track/CP-2026-00016');
              fetchComplaint('CP-2026-00016');
            }}
            className="text-[11px] font-mono text-[#39734D] hover:underline bg-[#39734D]/10 px-2 py-0.5 rounded border border-[#39734D]/20"
          >
            CP-2026-00016 (Resolved Sinkhole)
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318] p-4 rounded-lg text-xs flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {complaint && (
        <div className="space-y-6">
          {/* Main Status Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#DCE2E8] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE2E8]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#233B53] bg-[#F4F6F8] px-2.5 py-1 rounded border border-[#DCE2E8]">
                    {complaint.complaintId}
                  </span>
                  <span className="text-xs text-[#697786]">&bull;</span>
                  <span className="text-xs font-semibold text-[#233B53]">{complaint.category}</span>
                </div>
                <h2 className="text-xl font-bold text-[#263442] mt-2">{complaint.title}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} showScore />
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            {/* Visual Workflow Timeline */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#697786] mb-4">
                Resolution Workflow Progress
              </h3>
              <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  {workflowSteps.map((step) => {
                    const st = getStepStatus(step.key, complaint.status);
                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded border text-xs transition ${
                          st === 'complete'
                            ? 'bg-[#39734D]/10 border-[#39734D]/30 text-[#39734D]'
                            : st === 'current'
                            ? 'bg-[#315F80] text-white font-bold border-[#315F80] shadow-sm'
                            : 'bg-[#F4F6F8] border-[#DCE2E8] text-[#697786]'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {st === 'complete' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#39734D]" />
                          ) : st === 'current' ? (
                            <Clock className="w-4 h-4 text-white animate-pulse" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-[#DCE2E8]" />
                          )}
                        </div>
                        <span className="text-[11px] uppercase tracking-wide font-semibold">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Meta Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-4 border-t border-[#DCE2E8]">
              <div className="bg-[#F4F6F8] p-3.5 rounded border border-[#DCE2E8]">
                <div className="flex items-center text-[#697786] mb-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#315F80]" />
                  <span className="font-semibold">Incident Location</span>
                </div>
                <p className="font-bold text-[#233B53]">{complaint.address}</p>
                <div className="text-[10px] text-[#697786] mt-0.5 font-mono">
                  {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
                </div>
              </div>

              <div className="bg-[#F4F6F8] p-3.5 rounded border border-[#DCE2E8]">
                <div className="flex items-center text-[#697786] mb-1">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-[#315F80]" />
                  <span className="font-semibold">Assigned Department</span>
                </div>
                <p className="font-bold text-[#233B53]">
                  {complaint.assignedDepartmentId?.name || 'Under Department Routing'}
                </p>
                <div className="text-[10px] text-[#697786] mt-0.5">
                  {complaint.assignedOfficerId ? 'Officer Dispatched' : 'Triage in queue'}
                </div>
              </div>

              <div className="bg-[#F4F6F8] p-3.5 rounded border border-[#DCE2E8]">
                <div className="flex items-center text-[#697786] mb-1">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-[#315F80]" />
                  <span className="font-semibold">Date Registered</span>
                </div>
                <p className="font-bold text-[#233B53]">
                  {new Date(complaint.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <div className="text-[10px] text-[#697786] mt-0.5">
                  {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Description & AI Summary */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-[#697786]">Citizen Description:</span>
              <p className="text-xs text-[#263442] bg-[#F4F6F8] p-3.5 rounded border border-[#DCE2E8] leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Resolution Remarks if Resolved */}
            {complaint.status === 'RESOLVED' && complaint.resolutionRemarks && (
              <div className="bg-[#39734D]/10 border border-[#39734D]/30 p-4 rounded-lg space-y-2">
                <div className="flex items-center space-x-2 text-[#39734D] font-bold text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Official Resolution Notes</span>
                </div>
                <p className="text-xs text-[#263442] leading-relaxed italic">
                  "{complaint.resolutionRemarks}"
                </p>
                {complaint.resolvedAt && (
                  <p className="text-[11px] text-[#697786]">
                    Closed on {new Date(complaint.resolvedAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#DCE2E8] shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#233B53]">
              Chronological Audit Ledger & Progress Timeline
            </h3>
            <p className="text-xs text-[#697786]">
              Every supervisory action and department update is recorded with immutable timestamps.
            </p>

            <div className="space-y-4 pt-2">
              {history.map((h, i) => (
                <div key={h._id || i} className="flex items-start space-x-3 text-xs">
                  <div className="mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#315F80]"></div>
                  <div className="flex-1 bg-[#F4F6F8] p-3.5 rounded border border-[#DCE2E8] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#233B53]">
                        {h.previousStatus} &rarr; <span className="text-[#315F80]">{h.newStatus}</span>
                      </span>
                      <span className="text-[10px] text-[#697786]">
                        {new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#697786]">{h.remarks}</p>
                    {h.changedByName && (
                      <p className="text-[10px] text-[#547D99]">Logged by: {h.changedByName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

