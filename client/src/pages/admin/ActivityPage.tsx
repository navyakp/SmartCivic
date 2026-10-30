import React, { useEffect, useState } from 'react';
import { History, Shield, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const res = await api.getAdminComplaints({ limit: '30' });
        // Generate activity trail from complaint history items and complaints
        const trail: any[] = [];
        res.complaints.forEach((c) => {
          trail.push({
            id: `${c.complaintId}-created`,
            action: 'COMPLAINT_REGISTERED',
            entityId: c.complaintId,
            user: c.citizenName || 'Registered Citizen',
            role: 'citizen',
            details: `Grievance registered: "${c.title}" in '${c.category}'`,
            timestamp: c.createdAt,
          });

          if (c.status !== 'SUBMITTED') {
            trail.push({
              id: `${c.complaintId}-status`,
              action: `STATUS_${c.status}`,
              entityId: c.complaintId,
              user: c.assignedOfficerId?.name || 'Supervisory Desk',
              role: 'officer',
              details: `Workflow updated to ${c.status}. ${c.resolutionRemarks ? `Resolution remarks: "${c.resolutionRemarks}"` : ''}`,
              timestamp: c.updatedAt,
            });
          }

          if (c.priorityOverride) {
            trail.push({
              id: `${c.complaintId}-override`,
              action: 'PRIORITY_OVERRIDE',
              entityId: c.complaintId,
              user: c.priorityOverride.overriddenBy?.name || 'Administrator',
              role: 'admin',
              details: `Priority manually updated to ${c.priorityOverride.newPriority}. Reason: "${c.priorityOverride.reason}"`,
              timestamp: c.priorityOverride.overriddenAt,
            });
          }
        });

        // Sort descending
        trail.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(trail);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
          Compliance & Security
        </span>
        <h1 className="text-2xl font-bold text-[#233B53]">Activity & System Audit History</h1>
        <p className="text-xs text-[#697786] mt-0.5">
          Immutable event log of supervisory actions, priority overrides, and operational decisions.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DCE2E8] bg-[#F4F6F8] flex items-center justify-between">
          <span className="font-bold text-xs text-[#233B53] uppercase tracking-wider">
            Audit Trail
          </span>
          <span className="text-xs text-[#697786]">{activities.length} Recorded Events</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#697786]">Loading audit history...</div>
        ) : (
          <div className="divide-y divide-[#DCE2E8]">
            {activities.map((act) => (
              <div key={act.id} className="p-4 sm:p-5 hover:bg-[#F4F6F8]/60 transition flex items-start space-x-3 text-xs">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-[#315F80]/10 flex items-center justify-center text-[#315F80]">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#233B53]">{act.user}</span>
                      <span className="text-[10px] uppercase font-bold bg-[#F4F6F8] px-1.5 py-0.5 rounded border border-[#DCE2E8] text-[#697786]">
                        {act.role}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#315F80]">
                        #{act.entityId}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#697786]">
                      {new Date(act.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[#263442]">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
