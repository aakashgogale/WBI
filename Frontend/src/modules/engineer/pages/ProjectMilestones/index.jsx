import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiCircle, FiUpload, FiFileText, FiClock } from 'react-icons/fi';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { useAppNotifications } from '../../../../hooks/useAppNotifications';

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return { text: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-300' };
    case 'In Progress': return { text: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-500' };
    case 'Submitted': return { text: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-500' };
    case 'Under Review': return { text: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-500' };
    case 'Approved': return { text: 'text-green-500', bg: 'bg-green-50', border: 'border-green-500' };
    case 'Rejected': return { text: 'text-red-500', bg: 'bg-red-50', border: 'border-red-500' };
    case 'Completed': return { text: 'text-[#10AFA5]', bg: 'bg-teal-50', border: 'border-[#10AFA5]' };
    default: return { text: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-300' };
  }
};

const ProjectMilestones = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useAppNotifications('worker');

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  useEffect(() => {
    if (socket && projectId) {
      const handleUpdate = (update) => {
        if (update.projectId === projectId || update.relatedId === projectId) {
          fetchMilestones();
        }
      };
      socket.on('milestone_updated', handleUpdate);
      socket.on('project_updated', handleUpdate);

      return () => {
        socket.off('milestone_updated', handleUpdate);
        socket.off('project_updated', handleUpdate);
      };
    }
  }, [socket, projectId]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/workers/projects/${projectId}/milestones`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] p-4 space-y-4">
        <div className="h-14 bg-white rounded animate-pulse w-full"></div>
        <div className="h-40 bg-white rounded-2xl animate-pulse"></div>
        <div className="space-y-4 pt-4">
          {[1,2,3].map(n => <div key={n} className="h-24 bg-white rounded-2xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Milestones Not Found</h2>
        <button onClick={() => navigate(`/engineer/projects/${projectId}`)} className="text-[#10AFA5] font-bold">Go Back</button>
      </div>
    );
  }

  const { projectInfo, milestones } = data;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F8FCFC]  font-sans text-[#0F172A]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#F8FCFC] border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <button className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full" onClick={() => navigate(`/engineer/projects/${projectId}`)}>
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Milestones</h1>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-white border shadow-sm`}>
            {projectInfo.status}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* SUMMARY CARD */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">{projectInfo.projectName}</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Project ID: #{projectInfo.projectId.substring(0, 8).toUpperCase()}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 font-medium mb-1">Progress</p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-black text-[#10AFA5]">{projectInfo.progress}%</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 font-medium mb-1">Completed</p>
              <div className="flex items-end gap-1">
                <span className="text-xl font-black text-gray-800">{projectInfo.completedMilestones}</span>
                <span className="text-sm font-bold text-gray-400 mb-1">/ {projectInfo.totalMilestones}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-200 z-0"></div>

          <div className="space-y-4 relative z-10">
            {milestones.map((milestone, idx) => {
              const colors = getStatusColor(milestone.status);
              const isCompleted = milestone.status === 'Completed' || milestone.status === 'Approved';
              const isCurrent = milestone.status === 'In Progress' || milestone.status === 'Pending' || milestone.status === 'Rejected';
              const showSubmit = isCurrent && (milestone.status === 'In Progress' || milestone.status === 'Pending');

              return (
                <div key={milestone._id} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 overflow-hidden relative transition-all ${isCompleted ? 'bg-opacity-50' : ''}`}>
                  
                  {/* Visual Indicator */}
                  <div className="shrink-0 flex flex-col items-center z-10">
                    <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center bg-white border-2 ${colors.border}`}>
                      {isCompleted ? (
                        <FiCheck className={`w-4 h-4 ${colors.text}`} />
                      ) : (
                        <span className={`text-[10px] font-black ${colors.text}`}>{idx + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <h3 className="font-bold text-[#0F172A] text-[15px] mb-1 truncate pr-2">{milestone.title}</h3>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-bold ${colors.text}`}>
                        {milestone.status}
                      </span>
                    </div>

                    {(milestone.completedAt || milestone.assignedDate) && (
                      <p className="text-xs text-gray-500 mb-2">
                        {milestone.completedAt 
                          ? `Completed on ${formatDate(milestone.completedAt)}` 
                          : `Assigned: ${formatDate(milestone.assignedDate)}`}
                      </p>
                    )}

                    {milestone.description && (
                      <p className="text-[13px] text-gray-600 leading-relaxed mb-3 mt-1">
                        {milestone.description}
                      </p>
                    )}

                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                      <div className="mb-3 bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5"><FiFileText /> Deliverables</p>
                        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                          {milestone.deliverables.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}

                    {milestone.dueDate && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-3">
                        <FiClock /> Due: {formatDate(milestone.dueDate)}
                      </div>
                    )}

                    {showSubmit && (
                      <button 
                        onClick={() => navigate(`/engineer/projects/${projectId}/milestones/${milestone._id}/submit`)}
                        className="mt-2 w-full bg-[#10AFA5] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-teal-600 transition active:scale-[0.98]"
                      >
                        Submit Milestone
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMilestones;
