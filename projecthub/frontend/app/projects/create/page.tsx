'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { Skill, SkillImportance } from '../../../types';

export default function CreateProjectPage() {
  const router = useRouter();
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [status, setStatus] = useState<'idea' | 'recruiting' | 'in_progress' | 'completed'>('recruiting');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [maxTeamSize, setMaxTeamSize] = useState<number>(4);
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  // Selected Skills State: Map of skill_id -> importance
  const [selectedSkills, setSelectedSkills] = useState<Record<string, SkillImportance>>({});

  useEffect(() => {
    async function loadSkills() {
      try {
        const skills = await api.getSkills();
        setSkillsList(skills);
      } catch (err) {
        console.error('Failed to load skills:', err);
      }
    }
    loadSkills();
  }, []);

  const toggleSkill = (skillId: string, importance: SkillImportance) => {
    setSelectedSkills(prev => {
      const copy = { ...prev };
      if (copy[skillId] === importance) {
        delete copy[skillId];
      } else {
        copy[skillId] = importance;
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      setError('Please fill in all required project fields.');
      return;
    }
    if (maxTeamSize <= 0) {
      setError('Maximum team size must be at least 1.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const skillsPayload = Object.entries(selectedSkills).map(([skill_id, importance]) => ({
      skill_id,
      importance,
    }));

    try {
      const project = await api.createProject({
        title,
        description,
        problem_statement: problemStatement || undefined,
        category,
        status,
        visibility,
        max_team_size: Number(maxTeamSize),
        github_url: githubUrl || undefined,
        demo_url: demoUrl || undefined,
        skills: skillsPayload,
      });

      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
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
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="font-montserrat text-2xl font-bold text-white">Create New Project</h1>
        <p className="font-sans text-xs text-stone-400 mt-1">
          Publish your project idea, set required skills, form your team, and recruit teammates.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded border border-red-500/40 bg-red-950/40 text-red-300 text-xs font-sans">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-chai p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">
            Project Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. AI Study Assistant"
            className="w-full px-4 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-sm focus:outline-none focus:border-stone-500"
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-sans text-xs focus:outline-none focus:border-stone-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">
              Project Status <span className="text-red-400">*</span>
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-sans text-xs focus:outline-none focus:border-stone-500"
            >
              <option value="recruiting">Recruiting Teammates</option>
              <option value="idea">Idea Phase</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">
            Short Description <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Overview of what your project aims to accomplish..."
            className="w-full px-4 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-xs focus:outline-none focus:border-stone-500"
          />
        </div>

        {/* Problem Statement */}
        <div>
          <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">
            Problem Statement (Optional)
          </label>
          <textarea
            rows={2}
            value={problemStatement}
            onChange={e => setProblemStatement(e.target.value)}
            placeholder="What core problem or student pain point does this address?"
            className="w-full px-4 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-xs focus:outline-none focus:border-stone-500"
          />
        </div>

        {/* Team Capacity & Visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">
              Maximum Team Size <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={50}
              required
              value={maxTeamSize}
              onChange={e => setMaxTeamSize(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-mono text-xs focus:outline-none focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">
              Visibility <span className="text-red-400">*</span>
            </label>
            <select
              value={visibility}
              onChange={e => setVisibility(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-sans text-xs focus:outline-none focus:border-stone-500"
            >
              <option value="public">Public (Visible in Discovery)</option>
              <option value="private">Private (Team Members Only)</option>
            </select>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">
              GitHub Repository URL (Optional)
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={e => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/project"
              className="w-full px-4 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-xs focus:outline-none focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">
              Live Demo URL (Optional)
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={e => setDemoUrl(e.target.value)}
              placeholder="https://myproject.dev"
              className="w-full px-4 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-xs focus:outline-none focus:border-stone-500"
            />
          </div>
        </div>

        {/* Skills Requirements Selection */}
        <div className="space-y-3 pt-2 border-t border-stone-800">
          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300">
              Select Required & Preferred Skills
            </label>
            <p className="font-sans text-[11px] text-stone-400">
              Click once to mark as <span className="highlight font-medium">Required</span>, click twice for <span className="text-stone-300 font-medium">Preferred</span>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 rounded bg-stone-900/60 border border-stone-800">
            {skillsList.map(s => {
              const importance = selectedSkills[s.id];
              let btnClass = 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700';
              if (importance === 'required') {
                btnClass = 'bg-stone-800 text-cream border-stone-500';
              } else if (importance === 'preferred') {
                btnClass = 'bg-stone-900 text-stone-200 border-stone-600';
              }

              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => {
                    if (!importance) toggleSkill(s.id, 'required');
                    else if (importance === 'required') toggleSkill(s.id, 'preferred');
                    else toggleSkill(s.id, 'preferred');
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${btnClass}`}
                >
                  {s.name}
                  {importance && (
                    <span className="ml-1 text-[10px] uppercase font-mono">
                      ({importance === 'required' ? 'Req' : 'Pref'})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-asym-mirror flex-1 py-3 px-4 text-xs font-montserrat font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-asym flex-1 py-3 px-4 text-xs font-montserrat font-semibold disabled:opacity-50"
          >
            {submitting ? 'Creating Project & Team...' : 'Publish Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
