import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { NotificationItem } from '../types';

export const NotificationDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll notifications every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setOpen(false);
    if (item.complaintId) {
      navigate(`/admin/complaints/${item.complaintId}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-[#233B53] hover:bg-[#F4F6F8] rounded-md transition border border-transparent hover:border-[#DCE2E8]"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#B42318] text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-[#DCE2E8] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#F4F6F8] border-b border-[#DCE2E8]">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-[#233B53]">Official Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-[#233B53] text-white text-[11px] px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#315F80] hover:underline flex items-center"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#DCE2E8]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#697786]">
                No notifications to display.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition cursor-pointer hover:bg-[#F4F6F8] flex items-start space-x-3 ${
                    !item.isRead ? 'bg-[#315F80]/5' : ''
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {item.type === 'CRITICAL_ALERT' ? (
                      <AlertTriangle className="w-4 h-4 text-[#B42318]" />
                    ) : item.type === 'STATUS_UPDATE' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#39734D]" />
                    ) : (
                      <Info className="w-4 h-4 text-[#315F80]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#263442] truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-[#697786]">
                        {new Date(item.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#697786] line-clamp-2 mt-0.5">
                      {item.message}
                    </p>
                  </div>
                  {!item.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(item._id, e)}
                      title="Mark as read"
                      className="text-[#697786] hover:text-[#233B53] p-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
