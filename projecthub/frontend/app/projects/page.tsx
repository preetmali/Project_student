'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Project, PaginatedResponse, Skill } from '../../types';
import { ProjectCard } from '../../components/ui/ProjectCard';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { JoinRequestModal } from '../../components/ui/JoinRequestModal';
import { useAuth } from '../../lib/auth-context';

export default function ProjectsPage() {
  const { activeUserId } = useAuth();
  const [projectsData, setProjectsData] = useState<PaginatedResponse<Project> | null>(null);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [availability, setAvailability] = useState('');
  const [page, setPage] = useState(1);

  // Join Modal State
  const [selectedProjectForJoin, setSelectedProjectForJoin] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const skills = await api.getSkills();
        setSkillsList(skills);
      } catch (err) {
        console.error('Failed to load skills:', err);
      }
    }
    fetchSkills();
  }, []);

  const loadProjects = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProjects({
        page: pageNumber,
        limit: 9,
        search: search || undefined,
        category: category || undefined,
        status: status || undefined,
        skill: selectedSkill || undefined,
        availability: availability || undefined,
      });
      setProjectsData(res);
      setPage(pageNumber);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(1);
  }, [search, category, status, selectedSkill, availability, activeUserId]);

  const handleOpenJoinModal = (project: Project) => {
    setSelectedProjectForJoin(project);
    setIsModalOpen(true);
  };

  const handleSubmitJoinRequest = async (message: string) => {
    if (!selectedProjectForJoin) return;
    await api.requestToJoinProject(selectedProjectForJoin.id, message);
    await loadProjects(page);
  };

  const categories = [
    'AI/ML',
    'Web Development',
    'Mobile',
    'Healthcare',
    'Finance',
    'Education',
    'Social Impact',
    'Cybersecurity',
    'IoT',
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-white">Project Discovery</h1>
          <p className="font-sans text-xs text-stone-400 mt-1">
            Explore active student projects, search by skills, filter by capacity, and request to join suitable teams.
          </p>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="card-chai p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, description, or keyword..."
              className="w-full px-4 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-xs focus:outline-none focus:border-stone-500 placeholder:text-stone-600"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-sans text-xs focus:outline-none focus:border-stone-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-sans text-xs focus:outline-none focus:border-stone-500"
            >
              <option value="">All Statuses</option>
              <option value="recruiting">Recruiting</option>
              <option value="in_progress">In Progress</option>
              <option value="idea">Idea Phase</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-800">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Skill Filter */}
            <select
              value={selectedSkill}
              onChange={e => setSelectedSkill(e.target.value)}
              className="px-3 py-1.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-sans text-xs focus:outline-none"
            >
              <option value="">Filter by Skill</option>
              {skillsList.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={availability}
              onChange={e => setAvailability(e.target.value)}
              className="px-3 py-1.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-sans text-xs focus:outline-none"
            >
              <option value="">All Team Sizes</option>
              <option value="open">Has Open Positions</option>
              <option value="full">Full Teams Only</option>
            </select>

            {(search || category || status || selectedSkill || availability) && (
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setStatus('');
                  setSelectedSkill('');
                  setAvailability('');
                }}
                className="text-xs text-red-400 hover:text-red-300 font-mono"
              >
                Clear Filters ✕
              </button>
            )}
          </div>

          {projectsData && (
            <div className="text-xs font-mono text-stone-400">
              Showing <span className="font-semibold text-white">{projectsData.total}</span> projects
            </div>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <SkeletonLoader count={6} type="card" />
      ) : error ? (
        <div className="p-4 rounded border border-red-500/40 bg-red-950/40 text-red-300 text-xs text-center font-sans">
          {error}
        </div>
      ) : projectsData && projectsData.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsData.data.map(proj => (
              <ProjectCard key={proj.id} project={proj} onJoinClick={handleOpenJoinModal} />
            ))}
          </div>

          {/* Pagination Controls */}
          {projectsData.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-6 font-montserrat">
              <button
                onClick={() => loadProjects(page - 1)}
                disabled={page <= 1}
                className="btn-asym-mirror px-4 py-2 text-xs font-semibold disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-xs font-mono text-stone-400">
                Page {page} of {projectsData.totalPages}
              </span>
              <button
                onClick={() => loadProjects(page + 1)}
                disabled={page >= projectsData.totalPages}
                className="btn-asym-mirror px-4 py-2 text-xs font-semibold disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No projects found"
          description="We couldn't find any projects matching your search criteria. Try adjusting your filters or create a new project."
          actionLabel="+ Create New Project"
          actionHref="/projects/create"
        />
      )}

      {/* Join Request Modal */}
      <JoinRequestModal
        project={selectedProjectForJoin}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitJoinRequest}
      />
    </div>
  );
}
