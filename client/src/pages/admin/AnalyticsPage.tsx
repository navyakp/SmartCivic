import React, { useEffect, useState } from 'react';
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
  Legend,
} from 'recharts';
import { api } from '../../services/api';
import { BarChart3, TrendingUp, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [anRes, dashRes] = await Promise.all([api.getAnalytics(), api.getDashboard()]);
        setAnalytics(anRes);
        setStats(dashRes.stats);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const PRIORITY_COLORS: { [key: string]: string } = {
    CRITICAL: '#B42318',
    HIGH: '#C76B19',
    MEDIUM: '#B58A26',
    LOW: '#39734D',
  };

  const CATEGORY_COLORS = ['#233B53', '#315F80', '#547D99', '#B42318', '#C76B19', '#B58A26', '#39734D'];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
          Executive Analytics
        </span>
        <h1 className="text-2xl font-bold text-[#233B53]">Civic Analytics & Resolution Metrics</h1>
        <p className="text-xs text-[#697786] mt-0.5">
          Data-driven insights into municipal maintenance bottlenecks and service fulfillment.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <span className="text-xs font-semibold text-[#697786]">Resolution Velocity</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#315F80] mt-1">
            {stats?.avgResolutionHours || 36}h
          </div>
          <p className="text-[11px] text-[#697786] mt-1">Average turnaround</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <span className="text-xs font-semibold text-[#697786]">Resolution Rate</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#39734D] mt-1">
            {stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
          </div>
          <p className="text-[11px] text-[#39734D] mt-1">Cases verified closed</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <span className="text-xs font-semibold text-[#697786]">Hazard Concentration</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#B42318] mt-1">
            {stats?.critical ?? 0}
          </div>
          <p className="text-[11px] text-[#B42318] mt-1">Active critical alerts</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
          <span className="text-xs font-semibold text-[#697786]">Operational Load</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#C76B19] mt-1">
            {stats?.inProgress ?? 0}
          </div>
          <p className="text-[11px] text-[#C76B19] mt-1">Assigned field tasks</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-[#233B53]">Daily Grievance vs Resolution Velocity</h3>
          <div className="h-64">
            {analytics?.weeklyTrends ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE2E8" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="submitted" stroke="#315F80" strokeWidth={2} name="Submitted" />
                  <Line type="monotone" dataKey="resolved" stroke="#39734D" strokeWidth={2} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Complaints by Category Bar */}
        <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-[#233B53]">Category Volume</h3>
          <div className="h-64">
            {analytics?.byCategory ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.byCategory} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE2E8" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Bar dataKey="count" fill="#233B53" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Priority Severity Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-[#233B53]">Severity & Risk Priority Breakdown</h3>
          <div className="h-64">
            {analytics?.byPriority ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.byPriority}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE2E8" />
                  <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.byPriority.map((entry: any, i: number) => (
                      <Cell key={`cell-${i}`} fill={PRIORITY_COLORS[entry.priority] || '#315F80'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Department Workload Distribution */}
        <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-[#233B53]">Department Capacity & Backlog</h3>
          <div className="h-64">
            {analytics?.departmentWorkload ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.departmentWorkload}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE2E8" />
                  <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="active" fill="#C76B19" name="In Progress" stackId="a" />
                  <Bar dataKey="resolved" fill="#39734D" name="Resolved" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

