import React from 'react';
import {
  FileText,
  Search,
  UserCheck,
  Wrench,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const configs: Record<
    ComplaintStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    SUBMITTED: {
      label: 'Submitted',
      bg: 'bg-[#547D99]/10',
      text: 'text-[#315F80]',
      border: 'border-[#547D99]/30',
      icon: <FileText className="w-3.5 h-3.5 mr-1" />,
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      bg: 'bg-[#B58A26]/10',
      text: 'text-[#B58A26]',
      border: 'border-[#B58A26]/30',
      icon: <Search className="w-3.5 h-3.5 mr-1" />,
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-[#315F80]/10',
      text: 'text-[#233B53]',
      border: 'border-[#315F80]/30',
      icon: <UserCheck className="w-3.5 h-3.5 mr-1" />,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-[#C76B19]/10',
      text: 'text-[#C76B19]',
      border: 'border-[#C76B19]/30',
      icon: <Wrench className="w-3.5 h-3.5 mr-1" />,
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-[#39734D]/10',
      text: 'text-[#39734D]',
      border: 'border-[#39734D]/30',
      icon: <CheckCircle className="w-3.5 h-3.5 mr-1" />,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-[#B42318]/10',
      text: 'text-[#B42318]',
      border: 'border-[#B42318]/30',
      icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
    },
    REOPENED: {
      label: 'Reopened',
      bg: 'bg-[#C76B19]/15',
      text: 'text-[#C76B19]',
      border: 'border-[#C76B19]/40',
      icon: <RotateCcw className="w-3.5 h-3.5 mr-1" />,
    },
  };

  const config = configs[status] || configs.SUBMITTED;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

