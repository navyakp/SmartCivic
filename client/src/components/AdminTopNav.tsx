import React from 'react';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { useNavigate } from 'react-router-dom';

interface AdminTopNavProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({ onToggleSidebar, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-[#DCE2E8] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-md text-[#233B53] hover:bg-[#F4F6F8] border border-[#DCE2E8]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-base md:text-lg font-bold text-[#233B53] tracking-tight">
          {title || 'Command Center'}
        </h2>
      </div>

      <div className="flex items-center space-x-3 md:space-x-5">
        <NotificationDropdown />

        {/* User Info & Logout */}
        <div className="flex items-center space-x-3 pl-3 border-l border-[#DCE2E8]">
          <div className="w-8 h-8 rounded-full bg-[#233B53] text-white flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-[#233B53] leading-none">{user?.name}</p>
            <p className="text-[10px] uppercase font-bold text-[#697786] mt-0.5">
              {user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-[#697786] hover:text-[#B42318] hover:bg-[#F4F6F8] rounded transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
