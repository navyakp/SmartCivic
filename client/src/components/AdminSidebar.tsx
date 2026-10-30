import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Map,
  Brain,
  Copy,
  UserCheck,
  BarChart3,
  Building2,
  History,
  Settings,
  Shield,
  Home,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AdminSidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = true,
  onClose,
}) => {
  const { user } = useAuth();

  const links = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/admin/complaints', label: 'All Complaints', icon: ClipboardList },
    { to: '/admin/map', label: 'Live Issue Map', icon: Map },
    { to: '/admin/ai-insights', label: 'AI Intelligence', icon: Brain },
    { to: '/admin/duplicates', label: 'Duplicate Clusters', icon: Copy },
    { to: '/admin/assignments', label: 'Assignments', icon: UserCheck },
    { to: '/admin/analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { to: '/admin/departments', label: 'Departments & Teams', icon: Building2 },
    { to: '/admin/activity', label: 'Activity History', icon: History },
    { to: '/admin/settings', label: 'Settings & AI Diagnostics', icon: Settings },
  ];

  return (
    <aside
      className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#233B53] text-white flex flex-col justify-between transition-transform duration-200 border-r border-[#315F80]/30 shadow-md ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 bg-[#1B2F44] border-b border-[#315F80]/30">
          <div className="w-8 h-8 rounded bg-[#315F80] flex items-center justify-center mr-3 shadow-inner">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white leading-none">
              SmartCivic <span className="text-[#547D99]">ADMIN</span>
            </h1>
            <p className="text-[10px] text-[#DCE2E8]/70 mt-0.5 uppercase tracking-wider">
              {user?.role === 'admin' ? 'Municipal Authority' : 'Field Operations'}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3.5 py-2.5 rounded text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#315F80] text-white shadow-sm font-semibold'
                    : 'text-[#DCE2E8]/80 hover:bg-[#315F80]/40 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4 mr-3 flex-shrink-0 text-[#547D99]" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#315F80]/30 bg-[#1B2F44]">
        <NavLink
          to="/"
          className="flex items-center px-3 py-2 text-xs text-[#DCE2E8]/70 hover:text-white transition rounded hover:bg-[#315F80]/30"
        >
          <Home className="w-4 h-4 mr-2" />
          <span>Exit to Public Portal</span>
        </NavLink>
        <div className="mt-2 px-3 text-[10px] text-[#DCE2E8]/40">
          SmartCivic v1.0 &bull; Municipal Edition
        </div>
      </div>
    </aside>
  );
};

