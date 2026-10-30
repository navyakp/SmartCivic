import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, PlusCircle, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';

export const MyComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filtered, setFiltered] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getMyComplaints();
        setComplaints(res.complaints);
        setFiltered(res.complaints);
      } catch (err) {
        console.error('Failed to load my complaints:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    let result = [...complaints];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.complaintId.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter((c) => c.category === categoryFilter);
    }

    setFiltered(result);
  }, [searchTerm, statusFilter, categoryFilter, complaints]);

  const categories = [
    'ALL',
    'Roads and potholes',
    'Waterlogging',
    'Drainage and sewage',
    'Waste management',
    'Streetlights',
    'Public infrastructure',
    'Public safety',
    'Other',
  ];

  const statuses = [
    'ALL',
    'SUBMITTED',
    'UNDER_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'REJECTED',
    'REOPENED',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
            History & Tracking
          </span>
          <h1 className="text-2xl font-bold text-[#233B53] mt-0.5">My Submitted Complaints</h1>
          <p className="text-xs text-[#697786] mt-1">
            Review status updates, assigned departments, and verified resolution evidence.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-[#233B53] hover:bg-[#315F80] transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-lg border border-[#DCE2E8] shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#697786]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, keyword, road or address..."
            className="w-full pl-9 pr-3 py-2 border border-[#DCE2E8] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80]"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-[#DCE2E8] rounded-md text-xs bg-white text-[#263442] focus:outline-none focus:ring-1 focus:ring-[#315F80]"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-[#DCE2E8] rounded-md text-xs bg-white text-[#263442] focus:outline-none focus:ring-1 focus:ring-[#315F80]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#697786]">
            Loading your grievance records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-[#233B53]">No matching complaints found</p>
            <p className="text-xs text-[#697786]">
              Try adjusting your search terms or filters to find your submission.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#DCE2E8]">
            {filtered.map((c) => (
              <div
                key={c.complaintId}
                className="p-4 sm:p-6 hover:bg-[#F4F6F8]/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#233B53] bg-[#F4F6F8] px-2 py-0.5 rounded border border-[#DCE2E8]">
                      {c.complaintId}
                    </span>
                    <PriorityBadge priority={c.priority} score={c.priorityScore} showScore />
                    <StatusBadge status={c.status} />
                  </div>

                  <h3 className="text-base font-bold text-[#263442] truncate">{c.title}</h3>

                  <p className="text-xs text-[#697786] line-clamp-2">{c.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#697786] pt-1">
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-[#315F80]" />
                      <span className="truncate max-w-xs">{c.address}</span>
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-[#315F80]" />
                      <span>{new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                    {c.assignedDepartmentId && (
                      <span className="font-semibold text-[#233B53]">
                        Dept: {c.assignedDepartmentId.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 flex-shrink-0">
                  <Link
                    to={`/citizen/track/${c.complaintId}`}
                    className="inline-flex items-center px-4 py-2 rounded text-xs font-semibold text-white bg-[#233B53] hover:bg-[#315F80] transition shadow-sm"
                  >
                    <span>Track Status</span>
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

