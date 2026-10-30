import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../services/api';
import { Complaint, Department } from '../../types';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';

export const AllComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [departmentId, setDepartmentId] = useState('ALL');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '12',
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (category !== 'ALL') params.category = category;
      if (priority !== 'ALL') params.priority = priority;
      if (status !== 'ALL') params.status = status;
      if (departmentId !== 'ALL') params.departmentId = departmentId;

      const res = await api.getAdminComplaints(params);
      setComplaints(res.complaints);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await api.getDepartments();
        setDepartments(res.departments);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    }
    loadDepts();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, category, priority, status, departmentId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategory('ALL');
    setPriority('ALL');
    setStatus('ALL');
    setDepartmentId('ALL');
    setPage(1);
  };

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

  const priorities = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
            Central Grievance Ledger
          </span>
          <h1 className="text-2xl font-bold text-[#233B53]">All Complaints</h1>
          <p className="text-xs text-[#697786] mt-0.5">
            Search, filter, and manage every municipal report recorded in the database.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-[#233B53] bg-white px-3 py-1.5 rounded border border-[#DCE2E8] shadow-sm">
          <span>{total} Total Records</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-[#DCE2E8] shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#697786]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Complaint ID (e.g. CP-2026-00001), keywords, location..."
              className="w-full pl-9 pr-3 py-2 border border-[#DCE2E8] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#233B53] hover:bg-[#315F80] rounded transition shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DCE2E8]">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 border border-[#DCE2E8] rounded text-xs bg-white text-[#263442] focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 border border-[#DCE2E8] rounded text-xs bg-white text-[#263442] focus:outline-none"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 border border-[#DCE2E8] rounded text-xs bg-white text-[#263442] focus:outline-none"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>

          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 border border-[#DCE2E8] rounded text-xs bg-white text-[#263442] focus:outline-none"
          >
            <option value="ALL">Department: ALL</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                Dept: {d.code} - {d.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-2.5 py-1.5 text-xs text-[#697786] hover:text-[#233B53] flex items-center ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F6F8] text-[#697786] uppercase text-[10px] font-semibold border-b border-[#DCE2E8]">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title & Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2E8]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-xs text-[#697786]">
                    Loading complaints ledger...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-xs text-[#697786]">
                    No complaints matching the selected filters.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.complaintId} className="hover:bg-[#F4F6F8]/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-[#233B53] whitespace-nowrap">
                      {c.complaintId}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-[#263442] truncate">{c.title}</div>
                      <div className="text-[10px] text-[#697786]">{c.category}</div>
                    </td>
                    <td className="px-4 py-3 text-[#697786] max-w-[200px] truncate">
                      {c.address}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-[#233B53]">
                      {c.priorityScore}/100
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#697786]">
                      {new Date(c.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#233B53] font-medium">
                      {c.assignedDepartmentId?.name ? (
                        <span>{c.assignedDepartmentId.name}</span>
                      ) : (
                        <span className="text-[#697786] italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/complaints/${c.complaintId}`}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-[#233B53] bg-[#F4F6F8] hover:bg-[#DCE2E8] rounded border border-[#DCE2E8] transition"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-[#315F80]" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-[#F4F6F8] border-t border-[#DCE2E8] flex items-center justify-between text-xs text-[#697786]">
          <div>
            Showing Page <span className="font-bold text-[#233B53]">{page}</span> of{' '}
            <span className="font-bold text-[#233B53]">{totalPages}</span> ({total} items)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-[#DCE2E8] bg-white hover:bg-[#F4F6F8] disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-[#DCE2E8] bg-white hover:bg-[#F4F6F8] disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
