import React from 'react';

const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#F8FCFC] flex flex-col w-full max-w-md mx-auto relative overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center px-4 pt-6 pb-4">
        <div>
          <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
          <div className="w-24 h-4 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="px-4 mb-6">
        <div className="w-full h-12 bg-white border border-gray-100 rounded-2xl animate-pulse shadow-sm"></div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="px-4 flex-1">
        {/* Banner Skeleton */}
        <div className="w-full h-40 bg-gray-200 rounded-2xl animate-pulse mb-6"></div>

        {/* Categories Skeleton */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-12 h-3 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Section Skeleton */}
        <div className="w-40 h-6 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
        <div className="flex gap-4 overflow-hidden mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="w-64 h-40 bg-gray-200 rounded-2xl animate-pulse flex-shrink-0"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
