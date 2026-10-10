import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center card-chai">
      <div className="w-14 h-14 rounded-md bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 mb-4">
        {icon || (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>
      <h3 className="font-montserrat text-xl font-bold text-white mb-2">{title}</h3>
      <p className="font-sans text-stone-400 text-sm max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="btn-asym inline-flex items-center gap-2 px-5 py-2.5 text-xs font-montserrat font-semibold"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};
