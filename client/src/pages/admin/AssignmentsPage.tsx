import React, { useEffect, useState } from 'react';
import { UserCheck, Building2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Complaint, Department } from '../../types';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { Link } from 'react-router-dom';

export const AssignmentsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('UNASSIGNED');

  useEffect(() => {
    async function loadData() {
      try {
        const [compRes, deptRes] = await Promise.all([
          api.getAdminComplaints({ limit: '100' }),
          api.getDepartments(),
        ]);
        setComplaints(compRes.complaints);
        setDepartments(deptRes.departments);
      } catch (err) {
        console.error('Failed to load assignments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const unassigned = complaints.filter(
    (c) => !c.assignedDepartmentId && !['RESOLVED', 'REJECTED'].includes(c.status)
  );

  const displayedComplaints =
    selectedDeptId === 'UNASSIGNED'
      ? unassigned
      : complaints.filter(
          (c) => c.assignedDepartmentId?._id === selectedDeptId && !['RESOLVED', 'REJECTED'].includes(c.status)
        );

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
          Operations Dispatch
        </span>
        <h1 className="text-2xl font-bold text-[#233B53]">Department Assignments & Queues</h1>
        <p className="text-xs text-[#697786] mt-0.5">
          Route open grievances, balance departmental workloads, and assign field officers.
        </p>
      </div>

      {/* Department Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedDeptId('UNASSIGNED')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
            selectedDeptId === 'UNASSIGNED'
              ? 'bg-[#B42318] text-white border-[#B42318] shadow-sm'
              : 'bg-white text-[#233B53] border-[#DCE2E8] hover:bg-[#F4F6F8]'
          }`}
        >
          Unassigned Queue ({unassigned.length})
        </button>

        {departments.map((dept) => {
          const count = complaints.filter(
            (c) => c.assignedDepartmentId?._id === dept._id && !['RESOLVED', 'REJECTED'].includes(c.status)
          ).length;

          return (
            <button
              key={dept._id}
              onClick={() => setSelectedDeptId(dept._id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                selectedDeptId === dept._id
                  ? 'bg-[#233B53] text-white border-[#233B53] shadow-sm'
                  : 'bg-white text-[#233B53] border-[#DCE2E8] hover:bg-[#F4F6F8]'
              }`}
            >
              {dept.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Complaints in Selected Queue */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DCE2E8] bg-[#F4F6F8] flex items-center justify-between">
          <span className="font-bold text-xs text-[#233B53] uppercase tracking-wider">
            {selectedDeptId === 'UNASSIGNED'
              ? 'Complaints Awaiting Triage'
              : `Active Workload for ${departments.find((d) => d._id === selectedDeptId)?.name}`}
          </span>
          <span className="text-xs text-[#697786]">{displayedComplaints.length} Records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#697786]">Loading queues...</div>
        ) : displayedComplaints.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <UserCheck className="w-10 h-10 text-[#697786]/40 mx-auto" />
            <h4 className="font-bold text-sm text-[#233B53]">Queue is Clear</h4>
            <p className="text-xs text-[#697786]">No unresolved complaints currently in this queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#DCE2E8]">
            {displayedComplaints.map((c) => (
              <div
                key={c.complaintId}
                className="p-4 sm:p-5 hover:bg-[#F4F6F8]/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[#233B53] bg-[#F4F6F8] px-2 py-0.5 rounded border border-[#DCE2E8]">
                      {c.complaintId}
                    </span>
                    <PriorityBadge priority={c.priority} score={c.priorityScore} showScore />
                    <StatusBadge status={c.status} />
                  </div>
                  <h4 className="font-bold text-sm text-[#263442] truncate">{c.title}</h4>
                  <p className="text-[#697786] truncate">{c.address}</p>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <Link
                    to={`/admin/complaints/${c.complaintId}`}
                    className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-[#233B53] hover:bg-[#315F80] rounded transition shadow-sm"
                  >
                    <span>Assign & Dispatch</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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

