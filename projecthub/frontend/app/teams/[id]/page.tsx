'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Team, JoinRequest, TeamMember } from '../../../types';
import { TeamMemberCard } from '../../../components/ui/TeamMemberCard';
import { JoinRequestCard } from '../../../components/ui/JoinRequestCard';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { useAuth } from '../../../lib/auth-context';

export default function TeamManagementPage() {
  const params = useParams();
  const teamId = params?.id as string;
  const { activeUserId } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadTeamData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const teamData = await api.getTeamById(teamId);
      setTeam(teamData);

      const isLeader =
        teamData.created_by === activeUserId ||
        teamData.project?.owner_id === activeUserId ||
        teamData.members?.some(m => m.user_id === activeUserId && m.role === 'leader');

      if (isLeader) {
        const reqs = await api.getTeamJoinRequests(teamId);
        setRequests(reqs);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load team management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId, activeUserId]);

  const handleAcceptRequest = async (requestId: string) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await api.acceptJoinRequest(requestId);
      setActionSuccess(res.message || 'Candidate accepted into team!');
      await loadTeamData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to accept candidate.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await api.rejectJoinRequest(requestId);
      setActionSuccess('Join request rejected.');
      await loadTeamData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.removeTeamMember(teamId, userId);
      setActionSuccess('Team member removed successfully.');
      await loadTeamData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to remove member.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={2} type="card" />;
  }

  if (!team) {
    return (
      <div className="p-8 rounded border border-red-500/40 bg-red-950/40 text-red-300 text-center font-sans">
        Team not found or access denied.
      </div>
    );
  }

  const isLeader =
    team.created_by === activeUserId ||
    team.project?.owner_id === activeUserId ||
    team.members?.some(m => m.user_id === activeUserId && m.role === 'leader');

  const requiredSkills = team.project?.skills?.filter(s => s.importance === 'required') || [];

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
            Team Management
          </span>
          <h1 className="font-montserrat text-3xl font-extrabold text-white">{team.name}</h1>
          {team.project && (
            <p className="font-sans text-xs text-stone-400 mt-1">
              Project:{' '}
              <Link href={`/projects/${team.project.id}`} className="highlight font-medium underline">
                {team.project.title}
              </Link>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {team.project && (
            <Link
              href={`/projects/${team.project.id}`}
              className="btn-asym-mirror px-4 py-2.5 text-xs font-montserrat font-semibold"
            >
              View Project Page
            </Link>
          )}
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-4 rounded border border-red-500/40 bg-red-950/40 text-red-300 text-xs font-sans">
          ⚠️ {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded border border-stone-700 bg-stone-900/60 text-stone-200 text-xs font-sans">
          ✓ {actionSuccess}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Team Members & Required Skills Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Members List */}
          <div className="card-chai p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-800">
              <h3 className="font-montserrat text-xs font-bold text-stone-400 uppercase tracking-wider">
                Current Team Members ({team.current_members_count || 1} / {team.max_team_size || 4})
              </h3>
              <span className="font-sans text-xs highlight font-medium">
                {team.open_positions_count} open positions
              </span>
            </div>

            <div className="space-y-3">
              {team.members?.map(m => (
                <TeamMemberCard
                  key={m.id}
                  member={m}
                  isLeaderView={isLeader}
                  onRemove={handleRemoveMember}
                />
              ))}
            </div>
          </div>

          {/* Required Skills Match Matrix */}
          <div className="card-chai p-6 space-y-4">
            <h3 className="font-montserrat text-xs font-bold text-stone-400 uppercase tracking-wider">
              Required Skills Matrix
            </h3>
            <p className="font-sans text-xs text-stone-400">
              Displays whether current team members possess each skill required by the project.
            </p>

            {requiredSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {requiredSkills.map(ps => {
                  const sName = ps.skill?.name || 'Skill';
                  return (
                    <div
                      key={ps.id}
                      className="p-3 rounded bg-stone-900 border border-stone-800 flex justify-between items-center text-xs"
                    >
                      <span className="font-sans font-medium text-white">{sName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-stone-700 text-stone-300">
                        Required ✓
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-sans text-xs text-stone-500">No specific required skills listed.</p>
            )}
          </div>
        </div>

        {/* Right Column: Leader Join Requests Review */}
        <div className="space-y-6">
          {isLeader ? (
            <div className="card-chai p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                <h3 className="font-montserrat text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Pending Join Requests
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-stone-900 text-amber-300 border border-amber-500/40">
                  {requests.length}
                </span>
              </div>

              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map(req => (
                    <JoinRequestCard
                      key={req.id}
                      request={req}
                      mode="received"
                      onAccept={handleAcceptRequest}
                      onReject={handleRejectRequest}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs font-sans text-stone-400">
                  No pending join requests for this team.
                </div>
              )}
            </div>
          ) : (
            <div className="card-chai p-6 text-xs font-sans text-stone-400 text-center">
              Only the team leader can review join requests and manage team members.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
