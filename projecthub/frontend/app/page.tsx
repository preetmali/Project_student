'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-16 py-8 relative">
      {/* Background glow */}
      <div className="hero-hex-glow" />

      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-stone-800 bg-stone-900/60 text-stone-400 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-200" />
          ProjectHub Phase 2
        </div>
        
        <h1 className="font-montserrat text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Find Teammates. Build Real Projects.{' '}
          <span className="highlight">Excel Together.</span>
        </h1>

        <p className="font-sans text-base text-stone-400 leading-relaxed max-w-2xl mx-auto">
          Connect with talented students across college campuses for hackathons, capstone projects,
          and tech competitions. Create your project, assemble your team, or request to join exciting builds.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/projects"
            className="btn-asym px-6 py-3 text-sm font-montserrat font-semibold"
          >
            Discover Projects
          </Link>
          <Link
            href="/projects/create"
            className="btn-asym-mirror px-6 py-3 text-sm font-montserrat font-semibold"
          >
            Create a Project
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="card-chai p-6 space-y-3">
          <div className="w-9 h-9 rounded bg-stone-900 border border-stone-800 text-stone-300 font-mono flex items-center justify-center font-bold text-sm">
            01
          </div>
          <h3 className="font-montserrat text-lg font-bold text-white">Project Creation</h3>
          <p className="font-sans text-xs text-stone-400 leading-relaxed">
            Define your project vision, specify required & preferred skills, set team capacity, and launch recruiting.
          </p>
        </div>

        <div className="card-chai p-6 space-y-3">
          <div className="w-9 h-9 rounded bg-stone-900 border border-stone-800 text-stone-300 font-mono flex items-center justify-center font-bold text-sm">
            02
          </div>
          <h3 className="font-montserrat text-lg font-bold text-white">Team Management</h3>
          <p className="font-sans text-xs text-stone-400 leading-relaxed">
            Automatically form your project team, assign member roles, review candidate join requests, and manage open positions.
          </p>
        </div>

        <div className="card-chai p-6 space-y-3">
          <div className="w-9 h-9 rounded bg-stone-900 border border-stone-800 text-stone-300 font-mono flex items-center justify-center font-bold text-sm">
            03
          </div>
          <h3 className="font-montserrat text-lg font-bold text-white">Join Requests</h3>
          <p className="font-sans text-xs text-stone-400 leading-relaxed">
            Discover projects matching your stack, send join requests with custom messages, and track acceptance status in real time.
          </p>
        </div>
      </section>
    </div>
  );
}
