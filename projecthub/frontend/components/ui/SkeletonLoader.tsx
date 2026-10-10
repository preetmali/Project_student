import React from 'react';

export const SkeletonLoader: React.FC<{ count?: number; type?: 'card' | 'list' | 'detail' }> = ({
  count = 3,
  type = 'card',
}) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((_, i) => (
          <div
            key={i}
            className="card-chai p-6 animate-pulse flex flex-col justify-between h-72"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-stone-800 rounded w-3/4" />
                <div className="h-5 bg-stone-800 rounded w-20" />
              </div>
              <div className="h-4 bg-stone-800/60 rounded w-full mb-2" />
              <div className="h-4 bg-stone-800/60 rounded w-5/6 mb-4" />
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-stone-800/80 rounded w-16" />
                <div className="h-6 bg-stone-800/80 rounded w-20" />
              </div>
            </div>
            <div className="pt-4 border-t border-stone-800 flex justify-between items-center">
              <div className="h-4 bg-stone-800 rounded w-28" />
              <div className="h-9 bg-stone-800 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((_, i) => (
        <div
          key={i}
          className="card-chai p-4 animate-pulse flex justify-between items-center"
        >
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-stone-800 rounded w-1/3" />
            <div className="h-4 bg-stone-800/60 rounded w-2/3" />
          </div>
          <div className="h-9 bg-stone-800 rounded w-24" />
        </div>
      ))}
    </div>
  );
};
