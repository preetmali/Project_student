'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { ProfileWithSkills, Skill } from '../../../types';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { useAuth } from '../../../lib/auth-context';

export default function EditProfilePage() {
  const router = useRouter();
  const { activeUserId, refreshProfile } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');

  // User Skills State
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [proficiency, setProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [profData, skillsData] = await Promise.all([
          api.getProfile(),
          api.getSkills(),
        ]);
        setAllSkills(skillsData);

        const p = profData.profile;
        setFullName(p.full_name || '');
        setUsername(p.username || '');
        setBio(p.bio || '');
        setCollege(p.college || '');
        setCourse(p.course || '');
        setYear(p.year || '');
        setLocation(p.location || '');

        setUserSkills(profData.skills);
      } catch (err) {
        console.error('Failed to load edit profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeUserId]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.updateProfile({
        full_name: fullName,
        username,
        bio: bio || null,
        college: college || null,
        course: course || null,
        year: year || null,
        location: location || null,
      });
      await refreshProfile();
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId) return;
    try {
      const added = await api.addSkill(selectedSkillId, proficiency);
      setUserSkills(prev => [...prev, added]);
      setSelectedSkillId('');
    } catch (err: any) {
      alert(err.message || 'Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (userSkillId: string) => {
    try {
      await api.deleteSkill(userSkillId);
      setUserSkills(prev => prev.filter(s => s.id !== userSkillId));
    } catch (err: any) {
      alert(err.message || 'Failed to remove skill.');
    }
  };

  if (loading) {
    return <SkeletonLoader count={1} type="card" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="font-montserrat text-2xl font-bold text-white">Edit Profile & Skills</h1>
        <p className="font-sans text-xs text-stone-400 mt-0.5">Update personal details and manage your technical skills.</p>
      </div>

      {error && (
        <div className="p-4 rounded border border-red-500/40 bg-red-950/40 text-red-300 text-xs font-sans">
          {error}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleUpdateProfile} className="card-chai p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-xs focus:outline-none focus:border-stone-500"
            />
          </div>
          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-xs focus:outline-none focus:border-stone-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full px-4 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-xs focus:outline-none focus:border-stone-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">College / University</label>
            <input
              type="text"
              value={college}
              onChange={e => setCollege(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">Course / Major</label>
            <input
              type="text"
              value={course}
              onChange={e => setCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">Year of Study</label>
            <input
              type="text"
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Skills Management */}
        <div className="space-y-4 pt-4 border-t border-stone-800">
          <h3 className="font-montserrat text-xs font-bold text-stone-400 uppercase tracking-wider">Manage Your Skills</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedSkillId}
              onChange={e => setSelectedSkillId(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-sans text-xs focus:outline-none"
            >
              <option value="">Select a skill to add</option>
              {allSkills.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>

            <select
              value={proficiency}
              onChange={e => setProficiency(e.target.value as any)}
              className="px-3.5 py-2.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-sans text-xs focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <button
              type="button"
              onClick={handleAddSkill}
              className="btn-asym px-4 py-2.5 text-xs font-montserrat font-semibold"
            >
              + Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {userSkills.map(us => (
              <div
                key={us.id}
                className="px-3 py-1.5 rounded bg-stone-900 border border-stone-800 text-xs flex items-center gap-2 font-mono"
              >
                <span className="font-sans font-medium text-white">{us.skill?.name || 'Skill'}</span>
                <span className="text-[10px] text-stone-400 font-mono">({us.proficiency})</span>
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(us.id)}
                  className="text-stone-500 hover:text-red-400 font-bold ml-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="btn-asym-mirror flex-1 py-3 px-4 text-xs font-montserrat font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-asym flex-1 py-3 px-4 text-xs font-montserrat font-semibold disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
