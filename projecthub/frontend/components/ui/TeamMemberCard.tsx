import React from 'react';
import { TeamMember } from '../../types';

interface TeamMemberCardProps {
  member: TeamMember;
  isLeaderView?: boolean;
  onRemove?: (userId: string) => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  isLeaderView,
  onRemove,
}) => {
  const isLeaderRole = member.role === 'leader';
  const name = member.profile?.full_name || member.user?.email.split('@')[0] || 'Member';
  const username = member.profile?.username ? `@${member.profile.username}` : '';
  const college = member.profile?.college || 'Student';

  return (
    <div className="card-chai p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-md bg-stone-800 border border-stone-700 flex items-center justify-center text-white font-montserrat font-bold text-sm shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-montserrat text-sm font-semibold text-white truncate">{name}</h4>
            {isLeaderRole && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-amber-500/40 text-amber-300 uppercase tracking-wider">
                Leader
              </span>
            )}
          </div>
          <p className="font-sans text-xs text-stone-400 truncate">
            {username} • {college}
          </p>
        </div>
      </div>

      {isLeaderView && !isLeaderRole && onRemove && (
        <button
          onClick={() => onRemove(member.user_id)}
          className="px-3 py-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-montserrat font-semibold border border-red-500/30 transition-all shrink-0"
        >
          Remove
        </button>
      )}
    </div>
  );
};
