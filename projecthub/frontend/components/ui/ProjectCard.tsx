import React from 'react';
import Link from 'next/link';
import { Project } from '../../types';
import { StatusBadge } from './StatusBadge';
import { SkillBadge } from './SkillBadge';
import { useAuth } from '../../lib/auth-context';

interface ProjectCardProps {
  project: Project;
  onJoinClick?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onJoinClick }) => {
  const { activeUserId } = useAuth();
  const isOwner = project.owner_id === activeUserId;
  const isMember = project.user_is_member;
  const openPositions = project.open_positions_count ?? Math.max(0, project.max_team_size - (project.current_members_count || 0));
  const isFull = openPositions <= 0;
  const hasPendingRequest = project.user_request_status === 'pending';

  const requiredSkills = project.skills?.filter(s => s.importance === 'required') || [];
  const preferredSkills = project.skills?.filter(s => s.importance === 'preferred') || [];

  return (
    <div className="card-chai p-6 flex flex-col justify-between group">
      <div>
        {/* Header: Title + Status */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <span className="text-[11px] font-mono tracking-wider text-stone-400 block mb-1 uppercase">
              {project.category}
            </span>
            <Link href={`/projects/${project.id}`}>
              <h3 className="font-montserrat text-lg font-bold text-white group-hover:text-stone-200 transition-colors line-clamp-1">
                {project.title}
              </h3>
            </Link>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* Description */}
        <p className="font-sans text-stone-400 text-xs leading-relaxed line-clamp-2 mb-4">
          {project.description}
        </p>

        {/* Skills */}
        <div className="space-y-2 mb-5">
          {requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.slice(0, 3).map(ps => (
                <SkillBadge
                  key={ps.id}
                  name={ps.skill?.name || 'Skill'}
                  importance="required"
                  size="sm"
                />
              ))}
              {requiredSkills.length > 3 && (
                <span className="text-[10px] font-mono text-stone-500 self-center">
                  +{requiredSkills.length - 3} more
                </span>
              )}
            </div>
          )}

          {preferredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {preferredSkills.slice(0, 2).map(ps => (
                <SkillBadge
                  key={ps.id}
                  name={ps.skill?.name || 'Skill'}
                  importance="preferred"
                  size="sm"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        {/* Team Capacity Progress */}
        <div className="bg-stone-900/60 rounded-lg p-3 mb-4 border border-stone-800">
          <div className="flex justify-between items-center text-xs mb-1.5 font-sans">
            <span className="text-stone-400">Team Capacity</span>
            <span className="font-semibold text-white font-mono">
              {project.current_members_count || 1} / {project.max_team_size} members
            </span>
          </div>
          <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFull ? 'bg-amber-500/80' : 'bg-stone-200'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (((project.current_members_count || 1) / project.max_team_size) * 100)
                )}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-stone-400 mt-1.5 flex justify-between font-sans">
            <span>
              {isFull ? (
                <span className="text-amber-400/90 font-medium">Team Full</span>
              ) : (
                <span className="highlight font-medium">{openPositions} positions open</span>
              )}
            </span>
            <span className="text-stone-500">
              By {project.owner_profile?.full_name || 'Project Owner'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/projects/${project.id}`}
            className="btn-asym-mirror flex-1 text-center py-2 px-3 text-xs font-montserrat font-semibold"
          >
            View Details
          </Link>

          {!isOwner && !isMember && (
            <button
              onClick={() => onJoinClick && onJoinClick(project)}
              disabled={isFull || hasPendingRequest}
              className={`flex-1 py-2 px-3 rounded text-xs font-montserrat font-semibold transition-all ${
                hasPendingRequest
                  ? 'border border-amber-500/40 text-amber-300 cursor-not-allowed bg-amber-950/20'
                  : isFull
                  ? 'border border-stone-800 text-stone-600 cursor-not-allowed bg-stone-900/30'
                  : 'btn-asym'
              }`}
            >
              {hasPendingRequest
                ? 'Pending'
                : isFull
                ? 'Full'
                : 'Join Team'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
