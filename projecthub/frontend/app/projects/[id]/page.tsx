'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Project } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { SkillBadge } from '../../../components/ui/SkillBadge';
import { TeamMemberCard } from '../../../components/ui/TeamMemberCard';
import { JoinRequestModal } from '../../../components/ui/JoinRequestModal';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { useAuth } from '../../../lib/auth-context';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const { activeUserId } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Join Request Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const loadProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProjectById(projectId);
      setProject(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId, activeUserId]);

  const handleJoinSubmit = async (message: string) => {
    if (!project) return;
    await api.requestToJoinProject(project.id, message);
    setRequestSuccess(true);
    await loadProject();
  };

  if (loading) {
    return <SkeletonLoader count={1} type="card" />;
  }

  if (error || !project) {
    return (
      <div className="p-8 rounded border border-red-500/40 bg-red-950/40 text-red-300 text-center space-y-4 font-sans">
        <p className="text-sm font-semibold">{error || 'Project not found.'}</p>
        <Link
          href="/projects"
          className="btn-asym-mirror inline-block px-4 py-2 text-xs font-montserrat font-semibold"
        >
          ← Back to Discovery
        </Link>
      </div>
    );
  }

  const isOwner = project.owner_id === activeUserId;
  const isMember = project.user_is_member;
  const openPositions = project.open_positions_count ?? Math.max(0, project.max_team_size - (project.current_members_count || 0));
  const isFull = openPositions <= 0;
  const hasPendingRequest = project.user_request_status === 'pending';

  const requiredSkills = project.skills?.filter(s => s.importance === 'required') || [];
  const preferredSkills = project.skills?.filter(s => s.importance === 'preferred') || [];

  return (
    <div className="space-y-8 py-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
              {project.category}
            </span>
            <StatusBadge status={project.status} />
            {project.visibility === 'private' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-900 text-stone-400 border border-stone-800">
                Private
              </span>
            )}
          </div>
          <h1 className="font-montserrat text-3xl font-extrabold text-white">{project.title}</h1>
          <p className="font-sans text-xs text-stone-400 mt-1">
            Created by{' '}
            <span className="highlight font-medium">
              {project.owner_profile?.full_name || 'Project Owner'}
            </span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isOwner && project.team && (
            <Link
              href={`/teams/${project.team.id}`}
              className="btn-asym px-4 py-2.5 text-xs font-montserrat font-semibold"
            >
              Manage Team & Requests →
            </Link>
          )}

          {!isOwner && !isMember && (
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isFull || hasPendingRequest}
              className={`px-5 py-2.5 text-xs font-montserrat font-semibold transition-all ${
                hasPendingRequest
                  ? 'border border-amber-500/40 text-amber-300 cursor-not-allowed bg-amber-950/20'
                  : isFull
                  ? 'border border-stone-800 text-stone-600 cursor-not-allowed bg-stone-900/30'
                  : 'btn-asym'
              }`}
            >
              {hasPendingRequest
                ? 'Request Pending'
                : isFull
                ? 'Team Full'
                : 'Request to Join Team'}
            </button>
          )}
        </div>
      </div>

      {requestSuccess && (
        <div className="p-4 rounded border border-stone-700 bg-stone-900/60 text-stone-200 text-xs font-sans">
          ✓ Your join request has been submitted to the team leader!
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Overview & Problem Statement */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-chai p-6 space-y-3">
            <h3 className="font-montserrat text-xs font-bold text-stone-400 uppercase tracking-wider">
              Project Description
            </h3>
            <p className="font-sans text-sm text-stone-300 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {project.problem_statement && (
            <div className="card-chai p-6 space-y-3">
              <h3 className="font-montserrat text-xs font-bold text-stone-400 uppercase tracking-wider">
                Problem Statement
              </h3>
              <p className="font-sans text-sm text-stone-300 leading-relaxed whitespace-pre-line">
                {project.problem_statement}
              </p>
            </div>
          )}

          {/* Links */}
          {(project.github_url || project.demo_url) && (
            <div className="card-chai p-6 space-y-3">
              <h3 className="font-montserrat text-xs font-bold text-stone-400 uppercase tracking-wider">
                Project Links
              </h3>
              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-asym-mirror inline-flex items-center gap-2 px-3.5 py-2 font-montserrat"
                  >
                    💻 GitHub Code Repository ↗
                  </a>
                )}
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-asym-mirror inline-flex items-center gap-2 px-3.5 py-2 font-montserrat"
                  >
                    🚀 Live Demo ↗
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Skills & Team Members */}
        <div className="space-y-6">
          {/* Skill Requirements */}
          <div className="card-chai p-6 space-y-4">
            <h3 className="font-montserrat text-xs font-bold text-stone-400 uppercase tracking-wider">
              Required & Preferred Skills
            </h3>

            {requiredSkills.length > 0 && (
              <div className="space-y-2">
                <span className="font-sans text-xs font-medium highlight block">Required:</span>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map(ps => (
                    <SkillBadge
                      key={ps.id}
                      name={ps.skill?.name || 'Skill'}
                      importance="required"
                    />
                  ))}
                </div>
              </div>
            )}

            {preferredSkills.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <span className="font-sans text-xs font-medium text-stone-400 block">Preferred:</span>
                <div className="flex flex-wrap gap-2">
                  {preferredSkills.map(ps => (
                    <SkillBadge
                      key={ps.id}
                      name={ps.skill?.name || 'Skill'}
                      importance="preferred"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Team Capacity & Members */}
          <div className="card-chai p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-800">
              <h3 className="font-montserrat text-xs font-bold text-stone-400 uppercase tracking-wider">
                Team Members ({project.current_members_count || 1} / {project.max_team_size})
              </h3>
              {openPositions > 0 ? (
                <span className="font-sans text-xs highlight font-medium">
                  {openPositions} positions open
                </span>
              ) : (
                <span className="font-sans text-xs text-amber-400 font-medium">Team Full</span>
              )}
            </div>

            {project.team?.members && project.team.members.length > 0 ? (
              <div className="space-y-3">
                {project.team.members.map(m => (
                  <TeamMemberCard key={m.id} member={m} />
                ))}
              </div>
            ) : (
              <div className="font-sans text-xs text-stone-400">
                Owner is the current team leader.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <JoinRequestModal
        project={project}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleJoinSubmit}
      />
    </div>
  );
}
