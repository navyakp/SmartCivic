import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, PlusCircle, ListChecks, User } from 'lucide-react';

export const CitizenLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#315F80] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-[#697786]">Loading citizen account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { to: '/citizen', label: 'My Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/citizen/report', label: 'Report New Issue', icon: PlusCircle },
    { to: '/citizen/my-complaints', label: 'My Complaints', icon: ListChecks },
    { to: '/citizen/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8]">
      <Navbar />

      {/* Citizen Sub-Navigation Bar */}
      <div className="bg-white border-b border-[#DCE2E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto py-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-[#233B53] text-white shadow-sm'
                      : 'text-[#697786] hover:text-[#233B53] hover:bg-[#F4F6F8]'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-1.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

