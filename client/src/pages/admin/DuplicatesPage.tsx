import React, { useEffect, useState } from 'react';
import { Copy, AlertCircle, MapPin, ArrowRight, Check, X, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { Link } from 'react-router-dom';

export const DuplicatesPage: React.FC = () => {
  const [duplicateComplaints, setDuplicateComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDuplicates() {
      try {
        const res = await api.getDuplicates();
        setDuplicateComplaints(res.complaints);
      } catch (err) {
        console.error('Failed to load duplicate complaints:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDuplicates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
            Deduplication Review Hub
          </span>
          <h1 className="text-2xl font-bold text-[#233B53]">Duplicate Candidate Clusters</h1>
          <p className="text-xs text-[#697786] mt-0.5">
            Identify overlapping reports, prevent redundant dispatching, and preserve citizen tracking references.
          </p>
        </div>

        <div className="text-xs font-semibold text-[#233B53] bg-white px-3 py-1.5 rounded border border-[#DCE2E8] shadow-sm">
          {duplicateComplaints.length} Flagged Complaints
        </div>
      </div>

      {/* Protocol Notice */}
      <div className="bg-[#B58A26]/10 border border-[#B58A26]/30 p-4 rounded-lg flex items-start space-x-3 text-xs text-[#263442]">
        <Copy className="w-4 h-4 text-[#B58A26] mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <span className="font-bold text-[#233B53]">Non-Destructive Duplicate Detection Policy</span>
          <p className="text-[#697786] text-[11px] leading-relaxed">
            CivicPulse AI never automatically merges or deletes citizen complaints. Flagged reports are surfaced for administrative review while preserving each citizen's individual tracking reference and notification channel.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#697786]">
          Evaluating geographic and textual similarity candidates...
        </div>
      ) : duplicateComplaints.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-[#DCE2E8] text-center space-y-2">
          <Copy className="w-10 h-10 text-[#697786]/40 mx-auto" />
          <h3 className="font-bold text-sm text-[#233B53]">No Potential Duplicates Detected</h3>
          <p className="text-xs text-[#697786]">All current open complaints represent distinct spatial incidents.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicateComplaints.map((c) => (
            <div
              key={c.complaintId}
              className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE2E8]">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#233B53] bg-[#F4F6F8] px-2 py-0.5 rounded border border-[#DCE2E8]">
                    {c.complaintId}
                  </span>
                  <span className="text-xs font-semibold text-[#263442]">{c.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PriorityBadge priority={c.priority} score={c.priorityScore} showScore />
                  <StatusBadge status={c.status} />
                </div>
              </div>

              {/* Match Candidate Rows */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#697786]">
                  Candidate Matching Reports ({c.duplicateCandidates.length}):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {c.duplicateCandidates.map((dup) => (
                    <div
                      key={dup.complaintId}
                      className="bg-[#F4F6F8] p-3.5 rounded border border-[#DCE2E8] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#233B53]">
                          #{dup.complaintId}
                        </span>
                        <span className="bg-[#B58A26]/15 text-[#B58A26] px-2 py-0.5 rounded font-bold text-[10px]">
                          {dup.similarity}% Similarity Match
                        </span>
                      </div>
                      <p className="text-[#697786] text-[11px] leading-relaxed">{dup.reason}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-[#DCE2E8] text-[11px]">
                        <span className="text-[#697786]">Distance: {dup.distanceMeters}m</span>
                        <Link
                          to={`/admin/complaints/${dup.complaintId}`}
                          className="font-semibold text-[#315F80] hover:underline"
                        >
                          View Candidate &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  to={`/admin/complaints/${c.complaintId}`}
                  className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-[#233B53] hover:bg-[#315F80] rounded transition shadow-sm"
                >
                  <span>Manage in Complaint Desk</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
