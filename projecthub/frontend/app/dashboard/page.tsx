'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { DashboardStats, Project } from '../../types';
import { ProjectCard } from '../../components/ui/ProjectCard';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useAuth } from '../../lib/auth-context';

export default function DashboardPage() {
  const { activeUserId } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [statsData, projectsData] = await Promise.all([
          api.getDashboardStats(),
          api.getProjects({ page: 1, limit: 3 }),
        ]);
        setStats(statsData);
        setRecentProjects(projectsData.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [activeUserId]);

  if (loading) {
    return (
      <div className="space-y-8 py-4">
        <div className="h-8 bg-stone-900 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-stone-900/60 rounded-lg animate-pulse" />
          ))}
        </div>
        <SkeletonLoader count={3} type="card" />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="font-sans text-xs text-stone-400 mt-1">
            Real-time project statistics, team memberships, and pending requests.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/projects/create"
            className="btn-asym px-4 py-2.5 text-xs font-montserrat font-semibold"
          >
            + New Project
          </Link>
          <Link
            href="/projects"
            className="btn-asym-mirror px-4 py-2.5 text-xs font-montserrat font-semibold"
          >
            Browse Projects
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-chai p-5 space-y-2">
          <span className="font-sans text-xs font-medium text-stone-400 block">My Projects</span>
          <div className="font-mono text-3xl font-extrabold text-white">
            {stats?.totalProjectsCreated || 0}
          </div>
          <p className="font-mono text-[11px] text-stone-500">Created by you</p>
        </div>

        <div className="card-chai p-5 space-y-2">
          <span className="font-sans text-xs font-medium text-stone-400 block">Team Memberships</span>
          <div className="font-mono text-3xl font-extrabold text-white">
            {stats?.teamMemberships || 0}
          </div>
          <p className="font-mono text-[11px] text-stone-500">Active project teams</p>
        </div>

        <div className="card-chai p-5 space-y-2">
          <span className="font-sans text-xs font-medium text-stone-400 block">Pending Requests</span>
          <div className="font-mono text-3xl font-extrabold text-amber-300">
            {stats?.pendingJoinRequests || 0}
          </div>
          <p className="font-mono text-[11px] text-stone-500">Awaiting leader review</p>
        </div>

        <div className="card-chai p-5 space-y-2">
          <span className="font-sans text-xs font-medium text-stone-400 block">Open Positions</span>
          <div className="font-mono text-3xl font-extrabold text-white">
            {stats?.openTeamPositions || 0}
          </div>
          <p className="font-mono text-[11px] text-stone-500">Slots in your projects</p>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-montserrat text-lg font-bold text-white">Featured & Recent Projects</h2>
          <Link
            href="/projects"
            className="font-montserrat text-xs font-semibold highlight hover:text-white transition-colors"
          >
            View All Projects →
          </Link>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map(proj => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        ) : (
          <div className="card-chai p-8 text-center text-stone-400 text-xs">
            No projects available yet.{' '}
            <Link href="/projects/create" className="highlight underline">
              Create the first project!
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
