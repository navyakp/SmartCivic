import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  TrendingUp,
  Map,
  Brain,
  Building2,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { api } from '../../services/api';
import { DashboardStats, Complaint, Hotspot } from '../../types';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, analRes, hotRes] = await Promise.all([
          api.getDashboard(),
          api.getAnalytics(),
          api.getHotspots(),
        ]);
        setStats(dashRes.stats);
        setRecentComplaints(dashRes.recentComplaints || []);
        setAnalytics(analRes);
        setHotspots(hotRes.hotspots || []);
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const PRIORITY_COLORS: { [key: string]: string } = {
    CRITICAL: '#B42318',
    HIGH: '#C76B19',
    MEDIUM: '#B58A26',
    LOW: '#39734D',
  };

  const CATEGORY_COLORS = ['#315F80', '#547D99', '#233B53', '#C76B19', '#B58A26', '#39734D'];

  return (
    <div className="space-y-8">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
            Municipal Command Center
          </span>
          <h1 className="text-2xl font-bold text-[#233B53]">Civic Operations Overview</h1>
          <p className="text-xs text-[#697786] mt-0.5">
            Real-time complaint monitoring, AI prioritization, and departmental dispatch metrics.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/map"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-[#233B53] bg-white border border-[#DCE2E8] hover:bg-[#F4F6F8] rounded shadow-sm transition"
          >
            <Map className="w-3.5 h-3.5 mr-1.5 text-[#315F80]" />
            <span>Live Issue Map</span>
          </Link>
          <Link
            to="/admin/ai-insights"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-[#233B53] hover:bg-[#315F80] rounded shadow-sm transition"
          >
            <Brain className="w-3.5 h-3.5 mr-1.5" />
            <span>AI Intelligence</span>
          </Link>
        </div>
      </div>

      {/* 5 KPI Cards from Section 10 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697786]">Total Complaints</span>
            <FileText className="w-4 h-4 text-[#315F80]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#233B53] mt-2">
            {loading ? '...' : stats?.total ?? 0}
          </div>
          <div className="text-[11px] text-[#547D99] mt-1 font-medium">Recorded in registry</div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697786]">Pending Triage</span>
            <Clock className="w-4 h-4 text-[#B58A26]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#B58A26] mt-2">
            {loading ? '...' : stats?.pending ?? 0}
          </div>
          <div className="text-[11px] text-[#B58A26] mt-1 font-medium">Awaiting assignment</div>
        </div>

        {/* Critical */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#B42318]">Critical Hazards</span>
            <AlertTriangle className="w-4 h-4 text-[#B42318]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#B42318] mt-2">
            {loading ? '...' : stats?.critical ?? 0}
          </div>
          <div className="text-[11px] text-[#B42318] mt-1 font-medium">Immediate hazard alert</div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#C76B19]">In Progress</span>
            <Wrench className="w-4 h-4 text-[#C76B19]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#C76B19] mt-2">
            {loading ? '...' : stats?.inProgress ?? 0}
          </div>
          <div className="text-[11px] text-[#C76B19] mt-1 font-medium">Assigned field crews</div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-[#DCE2E8] shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#39734D]">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-[#39734D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#39734D] mt-2">
            {loading ? '...' : stats?.resolved ?? 0}
          </div>
          <div className="text-[11px] text-[#39734D] mt-1 font-medium">Verified completed</div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints by Category Chart */}
        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#233B53]">Complaints by Category</h3>
            <span className="text-[11px] text-[#697786]">Total Distribution</span>
          </div>
          <div className="h-64 w-full">
            {analytics?.byCategory && analytics.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE2E8" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#DCE2E8' }} />
                  <Bar dataKey="count" fill="#315F80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#697786]">
                Loading category chart data...
              </div>
            )}
          </div>
        </div>

        {/* Priority Distribution Chart */}
        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#233B53]">Priority Distribution</h3>
            <span className="text-[11px] text-[#697786]">Severity Breakdown</span>
          </div>
          <div className="h-64 w-full">
            {analytics?.byPriority ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.byPriority} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE2E8" />
                  <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#DCE2E8' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.byPriority.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#315F80'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#697786]">
                Loading priority chart data...
              </div>
            )}
          </div>
        </div>

        {/* Weekly Trend Line Chart */}
        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#233B53]">Weekly Submission vs Resolution Trends</h3>
            <span className="text-[11px] text-[#697786]">Past 7 Days</span>
          </div>
          <div className="h-64 w-full">
            {analytics?.weeklyTrends ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE2E8" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#DCE2E8' }} />
                  <Line type="monotone" dataKey="submitted" stroke="#315F80" strokeWidth={2} name="Submitted" />
                  <Line type="monotone" dataKey="resolved" stroke="#39734D" strokeWidth={2} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#697786]">
                Loading trend data...
              </div>
            )}
          </div>
        </div>

        {/* Department Workload Bar Chart */}
        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#233B53]">Department Workload</h3>
            <span className="text-[11px] text-[#697786]">Active vs Resolved</span>
          </div>
          <div className="h-64 w-full">
            {analytics?.departmentWorkload ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.departmentWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE2E8" />
                  <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#DCE2E8' }} />
                  <Bar dataKey="active" fill="#C76B19" name="Active / In Progress" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="resolved" fill="#39734D" name="Resolved" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#697786]">
                Loading workload data...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE GEOGRAPHIC HOTSPOTS BANNER */}
      {hotspots.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Map className="w-4 h-4 text-[#B42318]" />
              <h3 className="font-bold text-sm text-[#233B53]">
                Detected Geographic Issue Clusters ({hotspots.length} Active Hotspots)
              </h3>
            </div>
            <Link to="/admin/map" className="text-xs font-semibold text-[#315F80] hover:underline">
              Inspect on Full Map &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hotspots.slice(0, 3).map((hs) => (
              <div key={hs.id} className="bg-[#F4F6F8] p-4 rounded-lg border border-[#DCE2E8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#233B53]">{hs.id}</span>
                  <PriorityBadge priority={hs.priorityLevel} score={hs.averagePriorityScore} showScore />
                </div>
                <h4 className="font-bold text-xs text-[#263442]">{hs.primaryAddress}</h4>
                <p className="text-[11px] text-[#697786]">
                  <strong>{hs.complaintCount} open complaints</strong> in '{hs.topCategory}'.
                </p>
                <div className="text-[10px] bg-white p-2 rounded border border-[#DCE2E8] text-[#233B53] font-medium">
                  {hs.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT COMPLAINTS TABLE */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm overflow-hidden space-y-0">
        <div className="p-4 sm:p-5 border-b border-[#DCE2E8] flex items-center justify-between bg-[#F4F6F8]">
          <div>
            <h3 className="font-bold text-sm text-[#233B53]">Recent Complaints Ledger</h3>
            <p className="text-[11px] text-[#697786]">Real-time municipal grievance intake</p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-semibold text-[#315F80] hover:underline"
          >
            Manage All Complaints &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F6F8] text-[#697786] uppercase text-[10px] font-semibold border-b border-[#DCE2E8]">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title & Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2E8]">
              {recentComplaints.slice(0, 6).map((c) => (
                <tr key={c.complaintId} className="hover:bg-[#F4F6F8]/60 transition">
                  <td className="px-4 py-3 font-mono font-bold text-[#233B53] whitespace-nowrap">
                    {c.complaintId}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#263442] truncate max-w-xs">{c.title}</div>
                    <div className="text-[10px] text-[#697786]">{c.category}</div>
                  </td>
                  <td className="px-4 py-3 text-[#697786] max-w-xs truncate">
                    {c.address}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PriorityBadge priority={c.priority} score={c.priorityScore} showScore />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[#233B53] font-medium">
                    {c.assignedDepartmentId?.name || (
                      <span className="text-[#697786] italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/complaints/${c.complaintId}`}
                      className="px-2.5 py-1 text-xs font-semibold text-[#315F80] hover:text-[#233B53] hover:underline"
                    >
                      Manage &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

