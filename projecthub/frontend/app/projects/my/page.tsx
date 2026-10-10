'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Project } from '../../../types';
import { ProjectCard } from '../../../components/ui/ProjectCard';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useAuth } from '../../../lib/auth-context';

export default function MyProjectsPage() {
  const { activeUserId } = useAuth();
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMyProjects() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getMyProjects();
        setCreatedProjects(res.created);
        setJoinedProjects(res.joined);
      } catch (err: any) {
        setError(err.message || 'Failed to load projects.');
      } finally {
        setLoading(false);
      }
    }
    loadMyProjects();
  }, [activeUserId]);

  if (loading) {
    return <SkeletonLoader count={4} type="card" />;
  }

  return (
    <div className="space-y-10 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-white">My Projects & Teams</h1>
          <p className="font-sans text-xs text-stone-400 mt-1">
            Manage projects you created and view teams you belong to.
          </p>
        </div>
        <Link
          href="/projects/create"
          className="btn-asym px-4 py-2.5 text-xs font-montserrat font-semibold"
        >
          + Create New Project
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded border border-red-500/40 bg-red-950/40 text-red-300 text-xs font-sans">
          {error}
        </div>
      )}

      {/* Projects Created By Me */}
      <div className="space-y-4">
        <h2 className="font-montserrat text-lg font-bold text-white flex items-center gap-2">
          <span>Projects You Own</span>
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-stone-900 text-stone-300 border border-stone-800">
            {createdProjects.length}
          </span>
        </h2>

        {createdProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdProjects.map(proj => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="You haven't created any projects yet"
            description="Start by creating a project to define your idea, specify skill requirements, and form your team."
            actionLabel="+ Create Project"
            actionHref="/projects/create"
          />
        )}
      </div>

      {/* Teams I Belong To */}
      <div className="space-y-4 pt-4 border-t border-stone-800">
        <h2 className="font-montserrat text-lg font-bold text-white flex items-center gap-2">
          <span>Teams You Joined</span>
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-stone-900 text-stone-300 border border-stone-800">
            {joinedProjects.length}
          </span>
        </h2>

        {joinedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedProjects.map(proj => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        ) : (
          <div className="card-chai p-8 text-center text-stone-400 text-xs font-sans">
            You are not currently a member of any external teams.{' '}
            <Link href="/projects" className="highlight underline">
              Browse Project Discovery
            </Link>{' '}
            to request to join!
          </div>
        )}
      </div>
    </div>
  );
}
