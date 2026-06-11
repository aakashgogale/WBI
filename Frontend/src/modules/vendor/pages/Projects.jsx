import React from 'react';

const Projects = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500">Manage your assigned projects</p>
        </div>
        <button className="bg-[#10AFA5] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0D9488] transition-colors">
          + New Project
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">No Projects Found</h3>
        <p className="text-gray-500 mb-4">You don't have any active projects at the moment.</p>
      </div>
    </div>
  );
};

export default Projects;
