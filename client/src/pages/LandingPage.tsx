import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  MapPin,
  FileCheck,
  AlertTriangle,
  Lightbulb,
  Droplets,
  Trash2,
  Activity,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, Complaint } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getDashboard();
        setStats(res.stats);
        setRecentComplaints(res.recentComplaints || []);
      } catch (err) {
        console.warn('Dashboard stats load error (will retry or use fallback):', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    {
      name: 'Roads & Potholes',
      desc: 'Craters, road cave-ins, loose gravel, and uneven asphalt corridors.',
      icon: Layers,
      color: 'text-[#B42318]',
      bg: 'bg-[#B42318]/10',
    },
    {
      name: 'Water & Drainage',
      desc: 'Waterlogging, stormwater culvert choke-ups, and sewage backflow.',
      icon: Droplets,
      color: 'text-[#315F80]',
      bg: 'bg-[#315F80]/10',
    },
    {
      name: 'Waste Management',
      desc: 'Overflowing dumpsters, garbage piles, littering, and biohazard refuse.',
      icon: Trash2,
      color: 'text-[#B58A26]',
      bg: 'bg-[#B58A26]/10',
    },
    {
      name: 'Streetlights',
      desc: 'Dark road stretches, blinking fixtures, damaged poles, and timer failures.',
      icon: Lightbulb,
      color: 'text-[#C76B19]',
      bg: 'bg-[#C76B19]/10',
    },
    {
      name: 'Public Infrastructure',
      desc: 'Cracked pedestrian sidewalks, broken bus shelters, and damaged park railings.',
      icon: FileCheck,
      color: 'text-[#547D99]',
      bg: 'bg-[#547D99]/10',
    },
    {
      name: 'Public Safety',
      desc: 'Open manholes, hanging live electrical wires, and blind turn hazards.',
      icon: AlertTriangle,
      color: 'text-[#B42318]',
      bg: 'bg-[#B42318]/10',
    },
  ];

  return (
    <div className="space-y-16">
      {/* HERO SECTION */}
      <section className="bg-white border-b border-[#DCE2E8] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#315F80]/10 text-[#315F80] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Municipal Grievance Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#233B53] tracking-tight leading-tight">
              Your City. Your Voice. <br />
              <span className="text-[#315F80]">Our Action.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#697786] leading-relaxed">
              Report civic issues, help authorities identify critical problems through explainable AI,
              and track progress towards a safer, cleaner community in real time.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/citizen/report"
                className="inline-flex items-center px-6 py-3 rounded-md text-sm font-semibold text-white bg-[#233B53] hover:bg-[#315F80] shadow-sm transition"
              >
                <span>Report a Problem</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center px-6 py-3 rounded-md text-sm font-semibold text-[#233B53] bg-white border border-[#DCE2E8] hover:bg-[#F4F6F8] shadow-sm transition"
              >
                <Search className="w-4 h-4 mr-2 text-[#315F80]" />
                <span>Track Complaint</span>
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center px-4 py-3 rounded-md text-xs font-semibold text-[#697786] hover:text-[#233B53] transition"
              >
                <span>Authority Admin Portal &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC TRANSPARENCY STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#315F80]" />
            <h2 className="text-xs uppercase tracking-wider font-bold text-[#697786]">
              Real-Time Public Transparency
            </h2>
          </div>
          <p className="text-xl font-bold text-[#233B53]">Municipal Action In Numbers</p>
          <p className="text-xs text-[#697786]">Directly querying live civic resolution database</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
            <div className="text-xs font-medium text-[#697786]">Total Reported Issues</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#233B53] mt-1">
              {loading ? '...' : stats?.total ?? 0}
            </div>
            <div className="text-[11px] text-[#547D99] mt-1">Registered in municipal log</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
            <div className="text-xs font-medium text-[#697786]">Resolved Complaints</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#39734D] mt-1">
              {loading ? '...' : stats?.resolved ?? 0}
            </div>
            <div className="text-[11px] text-[#39734D] mt-1">Inspected & verified closed</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
            <div className="text-xs font-medium text-[#697786]">Active In Progress</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#C76B19] mt-1">
              {loading ? '...' : stats?.inProgress ?? 0}
            </div>
            <div className="text-[11px] text-[#C76B19] mt-1">Under assigned field teams</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-sm">
            <div className="text-xs font-medium text-[#697786]">Average Resolution Time</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#315F80] mt-1">
              {loading ? '...' : `${stats?.avgResolutionHours ?? 36}h`}
            </div>
            <div className="text-[11px] text-[#697786] mt-1">From submission to completion</div>
          </div>
        </div>
      </section>

      {/* CIVIC ISSUE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-wider font-bold text-[#697786]">Civic Domains</h2>
          <p className="text-xl font-bold text-[#233B53]">Report Any Community Problem</p>
          <p className="text-xs text-[#697786]">
            Our AI understands multiple categories and automatically routes to the right municipal department.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <div
              key={c.name}
              className="bg-white p-6 rounded-lg border border-[#DCE2E8] hover:border-[#315F80] transition shadow-sm group"
            >
              <div className={`w-10 h-10 rounded flex items-center justify-center ${c.bg} ${c.color} mb-4`}>
                <c.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#233B53] group-hover:text-[#315F80] transition">
                {c.name}
              </h3>
              <p className="text-xs text-[#697786] mt-1.5 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-white border-y border-[#DCE2E8] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-wider font-bold text-[#697786]">
              End-to-End Workflow
            </h2>
            <p className="text-2xl font-bold text-[#233B53] mt-1">How SmartCivic Works</p>
            <p className="text-xs text-[#697786] mt-1">
              From citizen grievance to verified municipal action in four transparent stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-[#F4F6F8] p-5 rounded-lg border border-[#DCE2E8]">
              <div className="w-7 h-7 rounded-full bg-[#233B53] text-white flex items-center justify-center text-xs font-bold mb-3">
                1
              </div>
              <h4 className="font-bold text-sm text-[#233B53]">1. Capture</h4>
              <p className="text-xs text-[#697786] mt-1.5 leading-relaxed">
                Citizens submit photos, text descriptions, and drop an exact Leaflet map pin in under one minute.
              </p>
            </div>

            <div className="bg-[#F4F6F8] p-5 rounded-lg border border-[#DCE2E8]">
              <div className="w-7 h-7 rounded-full bg-[#315F80] text-white flex items-center justify-center text-xs font-bold mb-3">
                2
              </div>
              <h4 className="font-bold text-sm text-[#233B53]">2. Understand</h4>
              <p className="text-xs text-[#697786] mt-1.5 leading-relaxed">
                Gemini AI categorizes issues, assesses urgency, detects duplicates, and computes an explainable 0–100 priority score.
              </p>
            </div>

            <div className="bg-[#F4F6F8] p-5 rounded-lg border border-[#DCE2E8]">
              <div className="w-7 h-7 rounded-full bg-[#547D99] text-white flex items-center justify-center text-xs font-bold mb-3">
                3
              </div>
              <h4 className="font-bold text-sm text-[#233B53]">3. Reveal</h4>
              <p className="text-xs text-[#697786] mt-1.5 leading-relaxed">
                Interactive live maps reveal geographic hotspots, duplicate clusters, and synthesize AI action briefs for authorities.
              </p>
            </div>

            <div className="bg-[#F4F6F8] p-5 rounded-lg border border-[#DCE2E8]">
              <div className="w-7 h-7 rounded-full bg-[#39734D] text-white flex items-center justify-center text-xs font-bold mb-3">
                4
              </div>
              <h4 className="font-bold text-sm text-[#233B53]">4. Act</h4>
              <p className="text-xs text-[#697786] mt-1.5 leading-relaxed">
                Departments assign officers, upload resolution remarks, and citizens track every milestone transparently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT PUBLIC COMPLAINTS STREAM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold text-[#697786]">
              Live Citizen Submissions
            </h2>
            <p className="text-xl font-bold text-[#233B53]">Recent Civic Activity</p>
          </div>
          <Link
            to="/track"
            className="text-xs font-semibold text-[#315F80] hover:underline flex items-center"
          >
            Track your complaint &rarr;
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm overflow-hidden">
          <div className="divide-y divide-[#DCE2E8]">
            {recentComplaints.slice(0, 5).map((c) => (
              <div key={c.complaintId} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F4F6F8]/60 transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#233B53]">
                      {c.complaintId}
                    </span>
                    <span className="text-xs text-[#697786]">&bull;</span>
                    <span className="text-xs font-medium text-[#233B53]">{c.category}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#263442]">{c.title}</h4>
                  <p className="text-xs text-[#697786] flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#315F80] flex-shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2 sm:self-center">
                  <PriorityBadge priority={c.priority} score={c.priorityScore} showScore />
                  <StatusBadge status={c.status} />
                  <Link
                    to={`/track/${c.complaintId}`}
                    className="text-xs font-medium text-[#315F80] bg-white border border-[#DCE2E8] px-2.5 py-1 rounded hover:bg-[#F4F6F8] transition"
                  >
                    Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[#233B53] text-white rounded-xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold">See a problem in your neighborhood?</h3>
            <p className="text-xs sm:text-sm text-[#DCE2E8]/80 leading-relaxed">
              Every report matters. SmartCivic ensures your grievance doesn't get lost in paperwork.
              Log your issue in under 60 seconds with photos and map coordinates.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/citizen/report"
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-[#233B53] bg-white hover:bg-[#F4F6F8] transition shadow-sm"
            >
              Report an Issue Now
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-white bg-[#315F80] hover:bg-[#547D99] transition border border-[#547D99]/40"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

