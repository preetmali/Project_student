import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-20 px-6 font-montserrat sm:px-12 before:absolute before:top-0 before:left-1/2 before:h-px before:w-full before:max-w-[1440px] before:-translate-x-1/2 before:bg-amber-600 before:opacity-10 before:[mask-image:linear-gradient(90deg,transparent_0%,black_40%,black_60%,transparent_100%)] dark:before:bg-orange-300">
      <div className="max-w-6xl mx-auto py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-sm text-muted-foreground">
        {/* Brand */}
        <div className="space-y-1">
          <p className="font-brand text-base font-semibold text-foreground tracking-tight">
            Project<span className="text-brand">Hub</span>
          </p>
          <p className="text-xs">Projects, teams and student collaboration.</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs">
          <Link href="/projects" className="hover:text-brand transition-colors duration-200">
            Discover projects
          </Link>
          <Link href="/projects/create" className="hover:text-brand transition-colors duration-200">
            Post a project
          </Link>
          <Link href="/projects/my" className="hover:text-brand transition-colors duration-200">
            My projects
          </Link>
          <Link href="/requests" className="hover:text-brand transition-colors duration-200">
            My requests
          </Link>
          <span className="text-muted-foreground/40 cursor-default">AI matching — phase 3</span>
        </div>
      </div>
    </footer>
  );
};
