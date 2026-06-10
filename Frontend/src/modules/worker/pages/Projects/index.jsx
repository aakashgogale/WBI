import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFilter, FiBriefcase, FiMenu, FiCamera, FiGlobe, FiTool, FiShield, FiCpu, FiTrendingUp } from 'react-icons/fi';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { workerTheme as themeColors } from '../../../../theme';

// Helper to render icon based on project type
const renderProjectIcon = (type) => {
  const typeStr = (type || '').toLowerCase();
  let Icon = FiBriefcase;
  let bgClass = 'bg-blue-50 text-blue-600';

  if (typeStr.includes('website') || typeStr.includes('web')) {
    Icon = FiGlobe;
    bgClass = 'bg-indigo-50 text-indigo-600';
  } else if (typeStr.includes('mobile') || typeStr.includes('app')) {
    Icon = FiMenu; // representing mobile menu
    bgClass = 'bg-purple-50 text-purple-600';
  } else if (typeStr.includes('cctv')) {
    Icon = FiCamera;
    bgClass = 'bg-gray-50 text-gray-700';
  } else if (typeStr.includes('crm') || typeStr.includes('marketing')) {
    Icon = FiTrendingUp;
    bgClass = 'bg-green-50 text-green-600';
  } else if (typeStr.includes('automation') || typeStr.includes('infrastructure')) {
    Icon = FiCpu;
    bgClass = 'bg-teal-50 text-teal-600';
  } else if (typeStr.includes('banking') || typeStr.includes('healthcare')) {
    Icon = FiShield;
    bgClass = 'bg-red-50 text-red-600';
  }

  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} shrink-0 shadow-sm border border-black/5`}>
      <Icon className="w-6 h-6" />
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Assigned': return 'bg-blue-100 text-blue-800';
    case 'In Progress': return 'bg-orange-100 text-orange-800';
    case 'On Hold': return 'bg-gray-200 text-gray-800';
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    case 'Under Review': return 'bg-purple-100 text-purple-800';
    case 'Client Review': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const Projects = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [counts, setCounts] = useState({ 'All': 0, 'In Progress': 0, 'On Hold': 0, 'Completed': 0 });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = ['All', 'In Progress', 'On Hold', 'Completed'];

  useEffect(() => {
    fetchCounts();
    fetchProjects(activeTab);
  }, [activeTab]);

  const fetchCounts = async () => {
    try {
      const res = await api.get('/api/workers/projects/counts');
      if (res.data.success) {
        setCounts(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching project counts:', error);
    }
  };

  const fetchProjects = async (status) => {
    try {
      setLoading(true);
      const url = status === 'All' ? '/api/workers/projects' : `/api/workers/projects?status=${status}`;
      const res = await api.get(url);
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FCFC]  font-sans">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
          <button className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full" onClick={() => navigate('/worker/dashboard')}>
            <FiMenu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#0F172A]">My Projects</h1>
          <button className="p-2 -mr-2 text-gray-600 hover:bg-gray-50 rounded-full">
            <FiFilter className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Filter Tabs */}
        <div className="px-4 flex overflow-x-auto scrollbar-hide border-b border-gray-100 bg-white">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-semibold transition-all relative ${
                activeTab === tab ? 'text-[#10AFA5]' : 'text-gray-500'
              }`}
            >
              {tab} ({counts[tab] || 0})
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10AFA5] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Project List */}
      <div className="p-4 space-y-4">
        {loading ? (
          // Skeleton Loaders
          [1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-4 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))
        ) : projects.length === 0 ? (
          // Empty State
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-teal-50 text-[#10AFA5] rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBriefcase className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Projects Found</h3>
            <p className="text-gray-500 text-sm">You don't have any {activeTab.toLowerCase()} projects at the moment.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.projectId}
              onClick={() => navigate(`/worker/projects/${project.projectId}`)}
              className="bg-white p-4 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 cursor-pointer transition active:scale-[0.98] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            >
              <div className="flex gap-4">
                {renderProjectIcon(project.projectType)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-[#0F172A] text-base truncate">{project.projectName}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{project.clientName}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5 mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">Progress</span>
                  <span className="font-bold text-[#10AFA5]">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#10AFA5] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex justify-between items-center text-[11px] pt-3 border-t border-gray-50">
                <div className="text-gray-600 truncate max-w-[60%]">
                  <span className="text-gray-400">Next Milestone:</span> <span className="font-medium text-gray-800">{project.nextMilestone}</span>
                </div>
                <div className="text-gray-600 shrink-0">
                  <span className="text-gray-400">Due:</span> <span className="font-medium text-gray-800">
                    {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;
