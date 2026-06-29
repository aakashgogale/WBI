import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShare2, FiPhone, FiMail, FiMapPin, FiMessageCircle, FiFileText, FiDownload, FiEye, FiClock, FiCheckCircle } from 'react-icons/fi';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { useAppNotifications } from '../../../../hooks/useAppNotifications';

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

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useAppNotifications('worker');

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    if (socket && projectId) {
      const handleProjectUpdate = (data) => {
        if (data.projectId === projectId || data.relatedId === projectId) {
          fetchProjectDetails();
        }
      };
      
      socket.on('project_updated', handleProjectUpdate);
      socket.on('milestone_updated', handleProjectUpdate);
      socket.on('payment_updated', handleProjectUpdate);

      return () => {
        socket.off('project_updated', handleProjectUpdate);
        socket.off('milestone_updated', handleProjectUpdate);
        socket.off('payment_updated', handleProjectUpdate);
      };
    }
  }, [socket, projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/workers/projects/${projectId}`);
      if (res.data.success) {
        setProject(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!project) return;
    const shareText = `Project: ${project.projectName}\nStatus: ${project.status}\nClient: ${project.clientId?.companyName || project.clientId?.name}\nID: #${project._id.substring(0, 8).toUpperCase()}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: project.projectName, text: shareText });
      } catch (err) {
        console.log('Share canceled', err);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] p-4 space-y-4">
        <div className="h-14 bg-white rounded animate-pulse w-full"></div>
        <div className="h-40 bg-white rounded-2xl animate-pulse"></div>
        <div className="h-60 bg-white rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Project Not Found</h2>
        <button onClick={() => navigate('/worker/projects')} className="text-[#10AFA5] font-bold">Go Back</button>
      </div>
    );
  }

  const client = project.clientId || {};
  const remainingAmount = Math.max(0, (project.totalAmount || 0) - (project.paidAmount || 0));
  
  // Format dates securely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F8FCFC]  font-sans text-[#0F172A]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#F8FCFC] border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <button className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full" onClick={() => navigate('/worker/projects')}>
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Project Details</h1>
          <button className="p-2 -mr-2 text-[#10AFA5] hover:bg-teal-50 rounded-full" onClick={handleShare}>
            <FiShare2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        
        {/* SUMMARY CARD */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="flex justify-between items-start gap-4 mb-2">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">{project.projectName}</h2>
              <p className="text-sm text-gray-500 mt-1">{client.companyName || client.name || 'Unknown Client'}</p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-bold shrink-0 ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-4 font-medium">Project ID: <span className="text-gray-800">#{project._id.substring(0, 8).toUpperCase()}</span></p>
        </div>

        {/* OVERVIEW */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
          <h3 className="text-base font-bold text-[#0F172A] mb-3">Project Overview</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{project.description || 'No description provided.'}</p>
          
          {project.scopeOfWork && project.scopeOfWork.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-800 mb-2">Scope of Work:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {project.scopeOfWork.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>
          )}

          {project.requirementsSummary && project.requirementsSummary.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2">Requirements Summary:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {project.requirementsSummary.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* INFORMATION */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
          <h3 className="text-base font-bold text-[#0F172A] mb-4">Project Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Start Date</span>
              <span className="font-medium text-gray-900">{formatDate(project.startDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Deadline</span>
              <span className="font-medium text-gray-900">{formatDate(project.dueDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Estimated Delivery</span>
              <span className="font-medium text-gray-900">{formatDate(project.estimatedDeliveryDate)}</span>
            </div>
            <div className="border-t border-gray-100 my-2 pt-2"></div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-bold text-gray-900">₹{project.totalAmount || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Paid Amount</span>
              <span className="font-bold text-gray-900">₹{project.paidAmount || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remaining</span>
              <span className="font-bold text-[#10AFA5]">₹{remainingAmount}</span>
            </div>
            <div className="flex justify-between text-sm items-center pt-2">
              <span className="text-gray-500">Status</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(project.status)}`}>{project.status}</span>
            </div>
          </div>
        </div>

        {/* CLIENT DETAILS */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
          <h3 className="text-base font-bold text-[#0F172A] mb-4">Client Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <span className="font-bold text-sm">{client.name?.charAt(0) || 'C'}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{client.companyName || client.name}</p>
                {client.companyName && <p className="text-xs text-gray-500">{client.name}</p>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiPhone className="text-[#10AFA5]" /> <span>{client.phone || 'N/A'}</span>
                </div>
                {client.phone && (
                  <div className="flex gap-2">
                    <a href={`tel:${client.phone}`} className="p-1.5 bg-green-100 text-green-600 rounded-lg"><FiPhone className="w-4 h-4" /></a>
                    <a href={`https://wa.me/${client.phone}`} target="_blank" rel="noreferrer" className="p-1.5 bg-green-500 text-white rounded-lg"><FiMessageCircle className="w-4 h-4" /></a>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600 truncate mr-2">
                  <FiMail className="text-[#10AFA5] shrink-0" /> <span className="truncate">{client.email || 'N/A'}</span>
                </div>
                {client.email && (
                  <a href={`mailto:${client.email}`} className="p-1.5 bg-[#10AFA5]/10 text-[#10AFA5] rounded-lg shrink-0"><FiMail className="w-4 h-4" /></a>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate(`/worker/projects/${projectId}/milestones`)}
            className="mt-5 w-full bg-[#10AFA5] text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-teal-600 transition active:scale-[0.98]"
          >
            View Milestones
          </button>
        </div>

        {/* PROJECT TEAM */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
          <h3 className="text-base font-bold text-[#0F172A] mb-4">Project Team</h3>
          <div className="space-y-4">
            {project.vendorId && (
              <div className="flex items-center gap-3">
                <img fetchPriority="low" loading="lazy" src={project.vendorId.profilePic || 'https://placehold.co/100'} alt="Vendor" className="w-10 h-10 rounded-full bg-gray-100 object-cover" />
                <div>
                  <p className="font-bold text-sm text-gray-900">{project.vendorId.companyName || project.vendorId.name}</p>
                  <p className="text-xs text-gray-500">Assigned Vendor</p>
                </div>
              </div>
            )}
            {project.workerId && (
              <div className="flex items-center gap-3">
                <img fetchPriority="low" loading="lazy" src={project.workerId.profilePic || 'https://placehold.co/100'} alt="Worker" className="w-10 h-10 rounded-full bg-gray-100 object-cover" />
                <div>
                  <p className="font-bold text-sm text-gray-900">{project.workerId.name}</p>
                  <p className="text-xs text-gray-500">Assigned Worker (You)</p>
                </div>
              </div>
            )}
            {project.adminSupervisor && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="font-bold text-sm">{project.adminSupervisor.name?.charAt(0) || 'A'}</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{project.adminSupervisor.name}</p>
                  <p className="text-xs text-gray-500">Admin Supervisor</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
          <h3 className="text-base font-bold text-[#0F172A] mb-4">Project Documents</h3>
          {(!project.documents || project.documents.length === 0) ? (
            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {project.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
                      <FiFileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{doc.title}</p>
                      <p className="text-xs text-gray-500">{doc.type || 'Document'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => window.open(doc.fileUrl, '_blank')} className="p-2 text-gray-500 hover:text-[#10AFA5] bg-gray-50 rounded-lg transition"><FiEye /></button>
                    <button onClick={() => window.open(doc.fileUrl, '_blank')} className="p-2 text-gray-500 hover:text-[#10AFA5] bg-gray-50 rounded-lg transition"><FiDownload /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TIMELINE */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
          <h3 className="text-base font-bold text-[#0F172A] mb-4">Activity Timeline</h3>
          {(!project.timeline || project.timeline.length === 0) ? (
            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl">No activities recorded yet.</p>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pb-2">
              {project.timeline.map((event, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#10AFA5]"></div>
                  <p className="text-sm font-bold text-gray-800">{event.event}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400 font-medium">
                    <FiClock /> {formatDate(event.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProjectDetails;
