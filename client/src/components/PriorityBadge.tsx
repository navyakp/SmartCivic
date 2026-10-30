import React from 'react';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { ComplaintPriority } from '../types';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  score?: number;
  showScore?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  score,
  showScore = false,
  className = '',
}) => {
  const configs: Record<
    ComplaintPriority,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    CRITICAL: {
      label: 'Critical Priority',
      bg: 'bg-[#B42318]/10',
      text: 'text-[#B42318]',
      border: 'border-[#B42318]/30',
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-[#B42318]" />,
    },
    HIGH: {
      label: 'High Priority',
      bg: 'bg-[#C76B19]/10',
      text: 'text-[#C76B19]',
      border: 'border-[#C76B19]/30',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-[#C76B19]" />,
    },
    MEDIUM: {
      label: 'Medium Priority',
      bg: 'bg-[#B58A26]/10',
      text: 'text-[#B58A26]',
      border: 'border-[#B58A26]/30',
      icon: <Clock className="w-3.5 h-3.5 mr-1 text-[#B58A26]" />,
    },
    LOW: {
      label: 'Low Priority',
      bg: 'bg-[#39734D]/10',
      text: 'text-[#39734D]',
      border: 'border-[#39734D]/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#39734D]" />,
    },
  };

  const config = configs[priority] || configs.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1.5 pl-1.5 border-l border-current opacity-80 font-mono">
          {score}/100
        </span>
      )}
    </span>
  );
};

