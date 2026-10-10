import React from 'react';
import { ProjectStatus, JoinRequestStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus | JoinRequestStatus | string;
  type?: 'project' | 'request';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'project' }) => {
  // ChaiUI rule: meaning uses colour as text or a thin outline ONLY — no filled pills
  let label = status as string;
  let colorClass = 'text-muted-foreground border-[var(--card-edge)]';

  if (type === 'project') {
    switch (status) {
      case 'recruiting':
        colorClass = 'text-green-500 border-green-500/30 dark:text-green-400 dark:border-green-400/30';
        label = 'Recruiting';
        break;
      case 'in_progress':
        colorClass = 'text-yellow-600 border-yellow-600/30 dark:text-yellow-400 dark:border-yellow-400/30';
        label = 'In progress';
        break;
      case 'completed':
        colorClass = 'text-muted-foreground border-[var(--card-edge)]';
        label = 'Completed';
        break;
      case 'idea':
        colorClass = 'text-purple-500 border-purple-500/30 dark:text-purple-400 dark:border-purple-400/30';
        label = 'Idea';
        break;
    }
  } else {
    switch (status) {
      case 'pending':
        colorClass = 'text-yellow-600 border-yellow-600/30 dark:text-yellow-400 dark:border-yellow-400/30';
        label = 'Pending';
        break;
      case 'accepted':
        colorClass = 'text-green-500 border-green-500/30 dark:text-green-400 dark:border-green-400/30';
        label = 'Accepted';
        break;
      case 'rejected':
        colorClass = 'text-red-500 border-red-500/30 dark:text-red-400 dark:border-red-400/30';
        label = 'Rejected';
        break;
      case 'cancelled':
        colorClass = 'text-muted-foreground border-[var(--card-edge)]';
        label = 'Cancelled';
        break;
    }
  }

  return (
    <span
      className={`chip border ${colorClass}`}
    >
      {label}
    </span>
  );
};
