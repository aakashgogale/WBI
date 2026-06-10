import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiCheck, FiSearch } from 'react-icons/fi';
import api from '../../../../services/api';
import { useAppNotifications } from '../../../../hooks/useAppNotifications';
import { motion } from 'framer-motion';

const ProjectUnderReview = () => {
  const { projectId, milestoneId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useAppNotifications('worker');

  useEffect(() => {
    fetchReviewStatus();
  }, [projectId, milestoneId]);

  useEffect(() => {
    if (socket && projectId) {
      const handleUpdate = (update) => {
        if (update.projectId === projectId || update.relatedId === projectId) {
          fetchReviewStatus();
        }
      };
      socket.on('milestone_updated', handleUpdate);
      return () => socket.off('milestone_updated', handleUpdate);
    }
  }, [socket, projectId]);

  const fetchReviewStatus = async () => {
    try {
      const res = await api.get(`/api/workers/projects/${projectId}/milestones/${milestoneId}/review`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load review status', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] p-4 space-y-4">
        <div className="h-14 bg-white rounded animate-pulse w-full"></div>
        <div className="h-48 bg-white rounded-2xl animate-pulse w-full"></div>
        <div className="h-32 bg-white rounded-2xl animate-pulse w-full"></div>
      </div>
    );
  }

  const { project, milestone, reviewer, expectedReviewTime } = data;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
           ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const timelineSteps = ['Assigned', 'In Progress', 'Submitted', 'Under Review', milestone.status === 'Rejected' ? 'Rejected' : 'Approved'];
  const currentIndex = timelineSteps.indexOf(milestone.status) !== -1 ? timelineSteps.indexOf(milestone.status) : 2;

  return (
    <div className="min-h-screen bg-[#F8FCFC]  font-sans text-[#0F172A]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#F8FCFC] border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <button className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full" onClick={() => navigate(`/worker/projects/${projectId}`)}>
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Project Under Review</h1>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="p-5 flex flex-col items-center">
        {/* Success Illustration */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="my-6 relative flex justify-center items-center w-32 h-32 bg-teal-50 rounded-full border-8 border-white shadow-sm"
        >
          <FiSearch className="w-14 h-14 text-[#10AFA5]" />
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <FiCheck className="text-white w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <h2 className="text-xl font-bold text-[#0F172A] mb-2">Milestone Submitted!</h2>
        <p className="text-sm text-gray-500 text-center max-w-[280px] mb-8 leading-relaxed">
          Your milestone is submitted for review. You will be notified soon once reviewed.
        </p>

        {/* Milestone Info Card */}
        <div className="w-full bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 mb-4">
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="col-span-2">
              <p className="text-xs text-gray-400 font-bold mb-1">Project</p>
              <p className="font-semibold text-gray-800">{project.name}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400 font-bold mb-1">Milestone</p>
              <p className="font-semibold text-gray-800">{milestone.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold mb-1">Submitted On</p>
              <p className="font-semibold text-gray-800 text-[13px]">{formatDate(milestone.submittedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold mb-1">Status</p>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                milestone.status === 'Rejected' ? 'bg-red-50 text-red-500 border border-red-500' :
                milestone.status === 'Approved' ? 'bg-green-50 text-green-500 border border-green-500' :
                'bg-blue-50 text-blue-500 border border-blue-500'
              }`}>
                {milestone.status}
              </span>
            </div>
          </div>
        </div>

        {/* Review Info Card */}
        <div className="w-full bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-600 font-bold">{reviewer.charAt(0)}</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold mb-0.5">Review By</p>
              <p className="font-semibold text-gray-800 text-sm">{reviewer}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <FiClock className="text-orange-500 w-5 h-5" />
            <span className="font-medium">Expected Review: <strong className="text-gray-800">{expectedReviewTime}</strong></span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button 
            onClick={() => navigate(`/worker/projects/${project.id}`)}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-[#10AFA5] hover:bg-teal-600 shadow-[0_4px_15px_rgba(16,175,165,0.3)] transition-all active:scale-[0.98]"
          >
            Back to Project
          </button>
          <button 
            onClick={() => navigate(`/worker/projects/${project.id}/milestones`)}
            className="w-full py-3.5 rounded-xl font-bold text-[#10AFA5] bg-teal-50 hover:bg-teal-100 transition-all active:scale-[0.98]"
          >
            View Milestones Roadmap
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectUnderReview;
