import React from 'react';
import { SkillImportance } from '../../types';

interface SkillBadgeProps {
  name: string;
  importance?: SkillImportance;
  category?: string;
  size?: 'sm' | 'md';
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  importance,
  size = 'md',
}) => {
  // ChaiUI: thin border chip, no filled backgrounds
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  let colorClass = 'text-muted-foreground border-[var(--card-edge)]';

  if (importance === 'required') {
    colorClass = 'text-green-500 border-green-500/30 dark:text-green-400 dark:border-green-400/30';
  } else if (importance === 'preferred') {
    colorClass = 'text-purple-500 border-purple-500/30 dark:text-purple-400 dark:border-purple-400/30';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-medium ${sizeClass} ${colorClass}`}
    >
      {name}
      {importance && (
        <span className="text-[9px] uppercase tracking-wider opacity-70">
          {importance === 'required' ? 'req' : 'pref'}
        </span>
      )}
    </span>
  );
};
