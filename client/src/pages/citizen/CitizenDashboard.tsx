import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Clock, CheckCircle2, AlertCircle, ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComplaints() {
      try {
        const res = await api.getMyComplaints();
        setComplaints(res.complaints);
      } catch (err) {
        console.error('Failed to load citizen complaints:', err);
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, []);

  const total = complaints.length;
  const pending = complaints.filter((c) => ['SUBMITTED', 'UNDER_REVIEW'].includes(c.status)).length;
  const inProgress = complaints.filter((c) => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
            Citizen Service Portal
          </span>
          <h1 className="text-2xl font-bold text-[#233B53] mt-0.5">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs text-[#697786] mt-1">
            Track your reported civic issues and view transparent municipal action updates.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="inline-flex items-center px-4 py-2.5 rounded-md text-sm font-semibold text-white bg-[#233B53] hover:bg-[#315F80] transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          <span>Report New Civic Issue</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697786]">Total Submitted</span>
            <FileText className="w-4 h-4 text-[#315F80]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#233B53] mt-2">
            {loading ? '...' : total}
          </div>
          <div className="text-[11px] text-[#697786] mt-1">Complaints registered</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697786]">Pending Review</span>
            <Clock className="w-4 h-4 text-[#B58A26]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#B58A26] mt-2">
            {loading ? '...' : pending}
          </div>
          <div className="text-[11px] text-[#697786] mt-1">Awaiting department triage</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697786]">In Progress</span>
            <AlertCircle className="w-4 h-4 text-[#C76B19]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#C76B19] mt-2">
            {loading ? '...' : inProgress}
          </div>
          <div className="text-[11px] text-[#697786] mt-1">Assigned field inspection</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697786]">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-[#39734D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#39734D] mt-2">
            {loading ? '...' : resolved}
          </div>
          <div className="text-[11px] text-[#697786] mt-1">Work verified completed</div>
        </div>
      </div>

      {/* Recent Submitted Complaints */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DCE2E8] flex items-center justify-between bg-[#F4F6F8]">
          <div>
            <h2 className="font-bold text-sm text-[#233B53]">My Submitted Grievances</h2>
            <p className="text-[11px] text-[#697786]">Latest status and progress updates from departments</p>
          </div>
          <Link
            to="/citizen/my-complaints"
            className="text-xs font-semibold text-[#315F80] hover:underline"
          >
            View All ({total}) &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#697786]">
            Loading your submitted records...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-[#697786]/40 mx-auto" />
            <h3 className="font-bold text-sm text-[#233B53]">No complaints submitted yet</h3>
            <p className="text-xs text-[#697786] max-w-sm mx-auto">
              Spot a pothole, waterlogging, or overflowing garbage? Log it now to alert your local municipality.
            </p>
            <Link
              to="/citizen/report"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#233B53] hover:bg-[#315F80] rounded shadow-sm transition"
            >
              Report Your First Issue
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#DCE2E8]">
            {complaints.slice(0, 5).map((c) => (
              <div
                key={c.complaintId}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F4F6F8]/60 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#233B53]">
                      {c.complaintId}
                    </span>
                    <span className="text-xs text-[#697786]">&bull;</span>
                    <span className="text-xs font-medium text-[#233B53]">{c.category}</span>
                    <span className="text-xs text-[#697786]">&bull;</span>
                    <span className="text-[11px] text-[#697786]">
                      {new Date(c.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#263442]">{c.title}</h4>
                  <p className="text-xs text-[#697786] flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#315F80] flex-shrink-0" />
                    <span>{c.address}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2 sm:self-center">
                  <PriorityBadge priority={c.priority} score={c.priorityScore} showScore />
                  <StatusBadge status={c.status} />
                  <Link
                    to={`/citizen/track/${c.complaintId}`}
                    className="text-xs font-medium text-[#315F80] bg-white border border-[#DCE2E8] px-3 py-1.5 rounded hover:bg-[#F4F6F8] transition"
                  >
                    Track Timeline
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

