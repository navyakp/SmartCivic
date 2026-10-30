import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, PlusCircle, Search, LogIn, UserPlus, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#DCE2E8] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded bg-[#233B53] flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-[#315F80] transition">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#233B53] block leading-none">
                SmartCivic <span className="text-[#315F80]">AI</span>
              </span>
              <span className="text-[10px] text-[#697786] font-medium tracking-wide">
                From Complaints to Action
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                isActive('/') ? 'text-[#233B53] bg-[#F4F6F8]' : 'text-[#697786] hover:text-[#233B53]'
              }`}
            >
              Home
            </Link>
            <a
              href="/#how-it-works"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-[#697786] hover:text-[#233B53] transition"
            >
              How It Works
            </a>
            <Link
              to="/citizen/report"
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition ${
                isActive('/citizen/report') ? 'text-[#233B53] bg-[#F4F6F8]' : 'text-[#697786] hover:text-[#233B53]'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-[#315F80]" />
              <span>Report Issue</span>
            </Link>
            <Link
              to="/track"
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition ${
                isActive('/track') ? 'text-[#233B53] bg-[#F4F6F8]' : 'text-[#697786] hover:text-[#233B53]'
              }`}
            >
              <Search className="w-4 h-4 text-[#315F80]" />
              <span>Track Status</span>
            </Link>
            {user && (user.role === 'admin' || user.role === 'officer') && (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-[#B42318] bg-[#B42318]/10 hover:bg-[#B42318]/20 transition flex items-center space-x-1"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Authority Admin</span>
              </Link>
            )}
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationDropdown />
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-[#233B53]">{user.name}</div>
                  <div className="text-[10px] uppercase font-bold text-[#697786] tracking-wider">
                    {user.role}
                  </div>
                </div>
                {user.role === 'citizen' && (
                  <Link
                    to="/citizen"
                    className="p-1.5 rounded-md text-[#233B53] hover:bg-[#F4F6F8] border border-[#DCE2E8]"
                    title="Citizen Dashboard"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md text-[#697786] hover:text-[#B42318] hover:bg-[#F4F6F8] transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-[#233B53] hover:bg-[#F4F6F8] border border-[#DCE2E8] transition flex items-center"
                >
                  <LogIn className="w-4 h-4 mr-1.5 text-[#315F80]" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium text-white bg-[#233B53] hover:bg-[#315F80] transition shadow-sm flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

