import React from 'react';
import { FiLoader } from 'react-icons/fi';

const PageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full text-gray-500">
      <FiLoader className="w-8 h-8 animate-spin text-[#4F46E5] mb-4" />
      <p className="text-sm font-medium animate-pulse">Loading...</p>
    </div>
  );
};

export default PageLoader;
