import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiAlertCircle, FiClock, FiMapPin, FiSearch, FiBell, FiCode, FiPhone, FiFigma } from 'react-icons/fi';
import { FaWallet, FaBriefcase, FaCalendarAlt, FaStar, FaFileSignature } from 'react-icons/fa';
import { BsDisplay } from 'react-icons/bs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../services/api';
import engineerService from '../../../../services/engineerService';
import { engineerAuthService } from '../../../../services/authService';
import { registerFCMToken } from '../../../../services/pushNotificationService';
import { SkeletonProfileHeader, SkeletonDashboardStats, SkeletonList } from '../../../../components/common/SkeletonLoaders';
import OptimizedImage from '../../../../components/common/OptimizedImage';
import { useSocket } from '../../../../context/SocketContext';
import WorkerJobAlertModal from '../../components/bookings/WorkerJobAlertModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const socket = useSocket();

  const [activeTab, setActiveTab] = useState('New Jobs');
  const [alertJobId, setAlertJobId] = useState(null);
  const [incomingJob, setIncomingJob] = useState(null);

  // Queries
  const { data: profileRes, isLoading: profileLoading } = useQuery({
    queryKey: ['engineerProfile'],
    queryFn: () => engineerService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['engineerDashboardStats'],
    queryFn: () => engineerService.getDashboardStats(),
    staleTime: 1000 * 30, // 30 seconds
  });

  const { data: completionRes, isLoading: completionLoading } = useQuery({
    queryKey: ['engineerProfileCompletion'],
    queryFn: () => engineerAuthService.getProfileCompletion(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: projectsRes, isLoading: projectsLoading } = useQuery({
    queryKey: ['engineerProjectsDashboard', 'In Progress'],
    queryFn: async () => {
      const res = await api.get('/engineers/projects?status=In Progress&page=1&limit=3');
      return res.data;
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  // Derived State
  const workerProfile = useMemo(() => {
    if (profileRes?.success && (profileRes?.engineer || profileRes?.worker)) {
      const profile = profileRes.engineer || profileRes.worker;
      return {
        name: profile.name || 'Engineer Name',
        photo: profile.profilePhoto || null,
        categories: profile.serviceCategories || (profile.serviceCategory ? [profile.serviceCategory] : []),
        address: profile.address,
        status: profile.status || 'OFFLINE',
        rating: profile.rating || 0
      };
    }
    return { name: 'Engineer Name', photo: null, categories: [], address: null, status: 'OFFLINE', rating: 0 };
  }, [profileRes]);

  const stats = useMemo(() => {
    if (statsRes?.success) {
      const { totalEarnings, activeJobs, activeProjects, completedJobs, recentJobs } = statsRes.data;
      return {
        thisMonthEarnings: totalEarnings || 0,
        pendingJobs: activeJobs || 0,
        activeProjects: activeProjects || 0,
        completedJobs: completedJobs || 0,
        recentJobs: recentJobs || []
      };
    }
    return { pendingJobs: 0, activeProjects: 0, completedJobs: 0, thisMonthEarnings: 0, recentJobs: [] };
  }, [statsRes]);

  const profileCompletion = completionRes?.success ? (completionRes.data?.completionPercentage || 0) : 0;

  const activeProjectsList = useMemo(() => {
    return projectsRes?.success ? (projectsRes.data || []) : [];
  }, [projectsRes]);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = '#F8FCFC';

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  useEffect(() => {
    registerFCMToken('worker', true).catch(err => console.error('FCM registration failed:', err));

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['engineerDashboardStats'] });
    };
    window.addEventListener('workerJobsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('workerJobsUpdated', handleUpdate);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewDigitalJob = (data) => {
      setIncomingJob(data);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      queryClient.invalidateQueries({ queryKey: ['engineerDashboardStats'] });
    };

    socket.on('new_digital_job', handleNewDigitalJob);

    return () => {
      socket.off('new_digital_job', handleNewDigitalJob);
    };
  }, [socket, queryClient]);

  const handleAcceptIncomingJob = async () => {
    if (!incomingJob) return;
    try {
      await engineerService.acceptDigitalJob(incomingJob.jobId);
      import('react-hot-toast').then(m => m.default.success('Job accepted!'));
      setIncomingJob(null);
      queryClient.invalidateQueries({ queryKey: ['engineerDashboardStats'] });
    } catch (err) {
      import('react-hot-toast').then(m => m.default.error('Failed to accept job'));
    }
  };

  const handleRejectIncomingJob = async () => {
    if (!incomingJob) return;
    try {
      await engineerService.rejectDigitalJob(incomingJob.jobId);
      setIncomingJob(null);
      queryClient.invalidateQueries({ queryKey: ['engineerDashboardStats'] });
    } catch (err) {
      import('react-hot-toast').then(m => m.default.error('Failed to reject job'));
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notif) => {
      if ((notif.type === 'booking_created' || notif.type === 'job_assigned') && notif.relatedId) {
        setAlertJobId(notif.relatedId);
      }
    };
    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [socket]);

  // Only show skeleton if we have NO cached data and are currently fetching
  if ((profileLoading && !profileRes) || (statsLoading && !statsRes)) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] px-4 py-6 space-y-6">
        <SkeletonProfileHeader />
        <SkeletonDashboardStats />
        <SkeletonList count={2} />
      </div>
    );
  }

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const tabs = ['New Jobs', 'Active Projects', 'Invites', 'Applied'];

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A] pb-20">
      
      {/* Top Header */}
      <header className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 cursor-pointer" onClick={() => navigate('/engineer/dashboard')}>
            <img fetchPriority="low" loading="lazy" src="/logo/WBILogo.jpg" alt="WBI Logo" className="h-full object-contain mix-blend-multiply" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-gray-900 transition-colors" onClick={() => navigate('/engineer/jobs')}>
            <FiSearch className="w-6 h-6" />
          </button>
          <button className="relative text-gray-600 hover:text-gray-900 transition-colors" onClick={() => navigate('/engineer/profile/notifications')}>
            <FiBell className="w-6 h-6" />
            {(stats?.pendingJobs > 0) && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#F8FCFC] rounded-full"></span>
            )}
          </button>
        </div>
      </header>

      <main className="px-5 space-y-6">
        
        {/* Greeting Section */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-[15px]">Good morning,</p>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {workerProfile?.name ? workerProfile.name.split(' ')[0] : 'Engineer'} <span className="text-2xl">👋</span>
            </h1>
          </div>
          <div 
            onClick={() => navigate('/engineer/profile')}
            className="w-12 h-12 rounded-full border-2 border-teal-600/20 overflow-hidden bg-teal-600 cursor-pointer shadow-sm"
          >
            {workerProfile?.photo ? (
              <OptimizedImage
                src={workerProfile.photo}
                alt={workerProfile?.name || 'Engineer'}
                className="w-full h-full object-cover"
                width={48}
                height={48}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                {workerProfile?.name ? workerProfile.name.charAt(0).toUpperCase() : 'E'}
              </div>
            )}
          </div>
        </div>

        {/* Complete Your Profile Warning */}
        {profileCompletion < 100 && (
          <div 
            onClick={() => navigate('/engineer/profile')}
            className="bg-[#FFF4E5] border border-[#FFE0B2] rounded-2xl p-4 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-[#FFE0B2] flex items-center justify-center text-[#E65100]">
                <FiAlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[#E65100] font-bold text-[15px]">Complete Your Profile</h3>
                <p className="text-[#E65100]/80 text-[11px] font-medium leading-tight mt-0.5">
                  Complete remaining details to start receiving jobs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#E65100]">
              <span className="font-bold text-base">{profileCompletion}%</span>
              <FiChevronRight className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* This Month's Overview (Dark Gradient Card) */}
        <div 
          className="rounded-3xl p-6 relative overflow-hidden shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
          }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-gray-300 text-sm font-medium">This Month's Overview</h3>
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center" onClick={() => navigate('/engineer/wallet')}>
                <FaWallet className="w-4 h-4 text-teal-400" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 items-end cursor-pointer" onClick={() => navigate('/engineer/wallet')}>
              <div className="col-span-1 min-w-max">
                <div className="flex items-baseline gap-1 text-white mb-1">
                  <span className="text-xl font-medium text-gray-400">₹</span>
                  <span className="text-3xl font-extrabold tracking-tight">{Number(stats?.thisMonthEarnings || 0).toLocaleString()}</span>
                </div>
                <p className="text-gray-400 text-xs font-medium">Earnings</p>
              </div>

              <div className="col-span-1 border-l border-gray-700 pl-4 text-center">
                <h4 className="text-2xl font-bold text-white mb-1">{String(stats?.pendingJobs || 0).padStart(2, '0')}</h4>
                <p className="text-gray-400 text-xs font-medium">Jobs</p>
              </div>

              <div className="col-span-1 border-l border-gray-700 pl-4 text-center">
                <h4 className="text-2xl font-bold text-white mb-1">{String(stats?.activeProjects || 0).padStart(2, '0')}</h4>
                <p className="text-gray-400 text-xs font-medium">Projects</p>
              </div>

              <div className="col-span-1 border-l border-gray-700 pl-4 text-center">
                <h4 className="text-2xl font-bold text-white mb-1">{String(stats?.completedJobs || 0).padStart(2, '0')}</h4>
                <p className="text-gray-400 text-xs font-medium">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (Horizontal Scroll) */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
          {[
            { icon: <FaBriefcase />, label: workerProfile?.status === 'ONLINE' ? 'Available\nFor Work' : 'Unavailable\n(Busy)', color: workerProfile?.status === 'ONLINE' ? 'text-teal-600' : 'text-gray-400', bg: workerProfile?.status === 'ONLINE' ? 'bg-teal-50' : 'bg-gray-100', isToggle: true },
            { icon: <FaCalendarAlt />, label: 'My\nSchedule', color: 'text-blue-500', bg: 'bg-blue-50', route: '/engineer/schedule' },
            { icon: <FaWallet />, label: 'My\nEarnings', color: 'text-emerald-500', bg: 'bg-emerald-50', route: '/engineer/wallet' },
            { icon: <FaFileSignature />, label: 'Proposals\nSent', color: 'text-purple-500', bg: 'bg-purple-50', route: '/engineer/proposals' },
            { icon: <FaStar />, label: `Reviews\n(${workerProfile?.rating?.toFixed(1) || '0.0'})`, color: 'text-orange-500', bg: 'bg-orange-50', route: '/engineer/profile/ratings' }
          ].map((action, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 min-w-[72px] shrink-0 cursor-pointer" 
              onClick={async () => {
                if (action.isToggle) {
                  try {
                    const newStatus = workerProfile?.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
                    await engineerService.updateProfile({ status: newStatus });
                    queryClient.invalidateQueries({ queryKey: ['engineerProfile'] });
                    import('react-hot-toast').then(m => m.default.success(`You are now ${newStatus === 'ONLINE' ? 'Available' : 'Unavailable'} for work!`));
                  } catch (err) {
                    import('react-hot-toast').then(m => m.default.error('Failed to update status'));
                  }
                } else if (action.route) {
                  navigate(action.route);
                }
              }}
            >
              <button className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.bg} shadow-sm border border-gray-100 active:scale-95 transition-transform`}>
                {React.cloneElement(action.icon, { className: `w-5 h-5 ${action.color}` })}
              </button>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight whitespace-pre-line">
                {action.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tabs Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors relative ${
                    activeTab === tab ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-teal-600 rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>
            <button className="text-teal-600 text-sm font-bold pb-3 shrink-0 pl-4" onClick={() => navigate('/engineer/jobs')}>
              View All
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-5 space-y-4">
            {activeTab === 'New Jobs' && (
              <>
                {stats?.recentJobs && stats.recentJobs.length > 0 ? (
                  stats.recentJobs.map((job) => {
                    const isDigital = !!job.isDigital;
                    const jobTitle = job?.serviceId?.name || job?.serviceId?.title || job?.serviceCategory || 'Service Task';
                    const clientName = isDigital ? (job?.address?.city || 'Digital Client') : (job?.userId?.name || 'Onsite Customer');
                    const priceDisplay = isDigital 
                      ? `₹${Number(job?.basePrice || 0).toLocaleString()} - ₹${Number(job?.finalAmount || 0).toLocaleString()}`
                      : `₹${Number(job?.finalAmount || job?.basePrice || 0).toLocaleString()}`;
                    
                    const displayDate = job?.scheduledDate || job?.createdAt
                      ? new Date(job.scheduledDate || job.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                      : 'N/A';

                    return (
                      <div 
                        key={job?._id || Math.random()} 
                        onClick={() => navigate(isDigital ? `/engineer/projects` : `/engineer/job/${job?._id}`)}
                        className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform"
                      >
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                            <FiCode className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${isDigital ? 'bg-indigo-500' : 'bg-teal-500'}`}>
                                {isDigital ? 'Digital' : 'Onsite'}
                              </span>
                              <span className="text-gray-400 text-xs font-medium">{displayDate}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-[15px] mb-1 truncate">
                              {jobTitle}
                            </h3>
                            <div className="flex items-center gap-1.5 mb-3 text-gray-500 text-xs font-medium truncate">
                              <BsDisplay className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{clientName}</span>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                              <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                <span>{priceDisplay}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${isDigital ? 'text-indigo-600 bg-indigo-50' : 'text-teal-600 bg-teal-50'}`}>
                                  {String(job?.status || 'New').replace('_', ' ')}
                                </span>
                                <FiChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <FaBriefcase className="text-gray-300 text-2xl" />
                    </div>
                    <h4 className="text-gray-900 font-bold mb-1">No Jobs Found</h4>
                    <p className="text-gray-500 text-sm max-w-[200px]">You have no recent jobs assigned</p>
                  </div>
                )}
              </>
            )}

            {activeTab !== 'New Jobs' && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <FaBriefcase className="text-gray-300 text-2xl" />
                </div>
                <h4 className="text-gray-900 font-bold mb-1">No Activity Found</h4>
                <p className="text-gray-500 text-sm max-w-[200px]">Check back later for updates</p>
              </div>
            )}
          </div>
        </div>

        {/* Projects In Progress Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-bold text-lg">Projects In Progress</h3>
            <button className="text-teal-600 text-sm font-bold pb-1" onClick={() => navigate('/engineer/projects')}>View All</button>
          </div>

          {projectsLoading ? (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-pulse h-36"></div>
          ) : activeProjectsList.length > 0 ? (
            <div className="space-y-4">
              {activeProjectsList.map((project) => {
                const dueDateDisplay = project.dueDate 
                  ? new Date(project.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'N/A';

                return (
                  <div key={project.projectId} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <BsDisplay className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 text-[15px] mb-1 truncate">{project.projectName}</h4>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium truncate">
                          <FiMapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{project.clientName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-end mb-2">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex-1 mr-3">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                        </div>
                        <span className="text-gray-900 font-bold text-sm leading-none">{project.progress || 0}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-gray-500 text-xs font-medium">Due Date: {dueDateDisplay}</span>
                      <button 
                        onClick={() => navigate(`/engineer/projects/${project.projectId}`)}
                        className="text-teal-600 font-bold text-xs border border-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <BsDisplay className="text-gray-300 text-2xl" />
              </div>
              <h4 className="text-gray-900 font-bold mb-1">No Projects in Progress</h4>
              <p className="text-gray-500 text-sm max-w-[200px]">You have no active projects at the moment</p>
            </div>
          )}
        </div>

      </main>

      <WorkerJobAlertModal
        isOpen={!!alertJobId}
        jobId={alertJobId}
        onClose={() => setAlertJobId(null)}
        onJobAccepted={(id) => {
          queryClient.invalidateQueries({ queryKey: ['engineerDashboardStats'] });
          navigate(`/engineer/job/${id}`);
        }}
      />
      
      {/* Uber-style Incoming Digital Job Modal */}
      {incomingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaBriefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1">New Job Request</h3>
              <p className="text-indigo-100 text-sm">From {incomingJob.vendorName}</p>
            </div>
            <div className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-2">{incomingJob.title}</h4>
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Budget:</span>
                  <span className="font-bold text-gray-900">₹{incomingJob.budget?.min} - ₹{incomingJob.budget?.max}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-bold text-gray-900">{incomingJob.duration?.value} {incomingJob.duration?.unit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Priority:</span>
                  <span className={`font-bold ${incomingJob.priority === 'Urgent' ? 'text-red-500' : 'text-orange-500'}`}>{incomingJob.priority}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleRejectIncomingJob}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Decline
                </button>
                <button 
                  onClick={handleAcceptIncomingJob}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-95 transition-all"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
