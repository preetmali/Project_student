'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { ProfileWithSkills } from '../../types';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useAuth } from '../../lib/auth-context';

export default function ProfilePage() {
  const { activeUserId } = useAuth();
  const [data, setData] = useState<ProfileWithSkills | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await api.getProfile();
        setData(res);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [activeUserId]);

  if (loading || !data) {
    return <SkeletonLoader count={1} type="card" />;
  }

  const { profile, skills } = data;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-white">My Student Profile</h1>
          <p className="font-sans text-xs text-stone-400 mt-0.5">Personal details, college background, and technical skills.</p>
        </div>
        <Link
          href="/profile/edit"
          className="btn-asym px-4 py-2 text-xs font-montserrat font-semibold"
        >
          Edit Profile & Skills
        </Link>
      </div>

      <div className="card-chai p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-stone-800 pb-6">
          <div className="w-14 h-14 rounded-md bg-stone-900 border border-stone-800 flex items-center justify-center text-white font-montserrat font-extrabold text-xl">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-montserrat text-xl font-bold text-white">{profile.full_name}</h2>
            <p className="font-sans text-xs highlight font-medium">@{profile.username}</p>
            <p className="font-sans text-xs text-stone-400 mt-1">
              {profile.college || 'College N/A'} • {profile.course || 'Course N/A'} ({profile.year || 'Year N/A'})
            </p>
          </div>
        </div>

        {profile.bio && (
          <div className="space-y-1">
            <span className="font-montserrat text-xs font-bold text-stone-400 uppercase tracking-wider block">Bio</span>
            <p className="font-sans text-xs text-stone-300 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <span className="font-montserrat text-xs font-bold text-stone-400 uppercase tracking-wider block">Skills & Proficiency</span>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map(us => (
                <div
                  key={us.id}
                  className="px-3 py-1.5 rounded bg-stone-900 border border-stone-800 text-xs flex items-center gap-2 font-mono"
                >
                  <span className="font-sans font-medium text-white">{us.skill?.name || 'Skill'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded border border-stone-700 text-stone-300">
                    {us.proficiency}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-sans text-xs text-stone-500">No skills added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
