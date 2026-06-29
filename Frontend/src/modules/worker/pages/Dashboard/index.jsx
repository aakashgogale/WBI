import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiAlertCircle, FiClock, FiMapPin } from 'react-icons/fi';
import { FaWallet, FaBriefcase, FaCheckCircle, FaProjectDiagram } from 'react-icons/fa';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';
import { registerFCMToken } from '../../../../services/pushNotificationService';
import { SkeletonProfileHeader, SkeletonDashboardStats, SkeletonList } from '../../../../components/common/SkeletonLoaders';
import OptimizedImage from '../../../../components/common/OptimizedImage';
import { useSocket } from '../../../../context/SocketContext';
import WorkerJobAlertModal from '../../components/bookings/WorkerJobAlertModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Dashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const queryClient = useQueryClient();
  const [alertJobId, setAlertJobId] = useState(null);

  // Set white/light background for clean theme
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

  const { data: profileRes, isLoading: loadingProfile } = useQuery({
    queryKey: ['workerProfile'],
    queryFn: () => workerService.getProfile(),
  });

  const { data: statsRes, isLoading: loadingStats } = useQuery({
    queryKey: ['workerDashboardStats'],
    queryFn: () => workerService.getDashboardStats(),
  });

  const loading = loadingProfile || loadingStats;

  const profile = profileRes?.worker || {};
  const workerProfile = {
    name: profile.name || 'Engineer Name',
    photo: profile.profilePhoto || null,
    categories: profile.serviceCategories || (profile.serviceCategory ? [profile.serviceCategory] : []),
    address: profile.address,
  };

  const rawStats = statsRes?.data || {};
  const stats = {
    thisMonthEarnings: rawStats.totalEarnings || 0,
    pendingJobs: rawStats.activeJobs || 0,
    activeProjects: rawStats.activeProjects || 0,
    completedJobs: rawStats.completedJobs || 0,
    recentJobs: rawStats.recentJobs || []
  };

  useEffect(() => {
    registerFCMToken('worker', true).catch(err => console.error('FCM registration failed:', err));

    const handleUpdate = () => {
      queryClient.invalidateQueries(['workerDashboardStats']);
      queryClient.invalidateQueries(['workerProfile']);
    };
    window.addEventListener('workerJobsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('workerJobsUpdated', handleUpdate);
    };
  }, [queryClient]);

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

  if (loading) {
    return (
      <div className="min-h-screen  bg-[#F8FCFC]">
        <Header title="" showBack={false} />
        <main className="px-4 py-4 space-y-6">
          <SkeletonProfileHeader />
          <SkeletonDashboardStats />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
            <SkeletonList count={2} />
          </div>
        </main>
      </div>
    );
  }

  // Profile completeness check
  const isProfileIncomplete = (!workerProfile?.categories || workerProfile?.categories?.length === 0) ||
    (!workerProfile?.address || typeof workerProfile.address !== 'object' || Object.keys(workerProfile.address).length === 0);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="min-h-screen  bg-slate-50 font-sans selection:bg-teal-100">
      <Header title="" showBack={false} showSearch={true} showNotifications={true} notificationCount={stats?.pendingJobs || 0} />

      <main className="px-5 pt-2 space-y-8">
        
        {/* Header Section (Greeting) */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Good morning,</p>
            <h2 className="text-slate-900 text-2xl font-bold tracking-tight">
              {workerProfile?.name ? workerProfile.name.split(' ')[0] : 'Worker'}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden bg-white shadow-sm shrink-0" onClick={() => navigate('/worker/profile')}>
            {workerProfile?.photo ? (
              <OptimizedImage
                src={workerProfile.photo}
                alt={workerProfile?.name || 'Worker'}
                className="w-full h-full object-cover"
                width={48}
                height={48}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-teal-600 text-white font-bold text-lg">
                {workerProfile?.name ? workerProfile.name.charAt(0) : 'W'}
              </div>
            )}
          </div>
        </div>

        {/* Profile Incomplete Warning */}
        {isProfileIncomplete && (
          <div 
            onClick={() => navigate('/worker/profile')}
            className="flex items-center justify-between p-4 rounded-2xl cursor-pointer bg-orange-50 border border-orange-100/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100/50 flex items-center justify-center text-orange-600">
                <FiAlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-orange-900 font-semibold text-sm">Complete Profile</h4>
                <p className="text-orange-600/80 text-xs mt-0.5">Required to receive jobs</p>
              </div>
            </div>
            <FiChevronRight className="w-5 h-5 text-orange-400" />
          </div>
        )}

        {/* Premium Earnings Card */}
        <div 
          className="relative rounded-[2rem] p-6 overflow-hidden shadow-xl shadow-teal-900/10"
          style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
          }}
        >
          {/* Subtle background glow/noise */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm font-medium">This Month's Earnings</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <FaWallet className="w-4 h-4 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-slate-400 text-2xl font-medium">₹</span>
                <h1 className="text-white text-5xl font-extrabold tracking-tight">
                  {Number(stats?.thisMonthEarnings || 0).toLocaleString()}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid (3 columns) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Active Jobs */}
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
              <FaBriefcase className="w-4 h-4" />
            </div>
            <h4 className="text-slate-900 font-bold text-xl">{String(stats?.pendingJobs || 0).padStart(2, '0')}</h4>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider mt-1">Jobs</p>
          </div>

          {/* Active Projects */}
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-2">
              <FaProjectDiagram className="w-4 h-4" />
            </div>
            <h4 className="text-slate-900 font-bold text-xl">{String(stats?.activeProjects || 0).padStart(2, '0')}</h4>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider mt-1">Projects</p>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
              <FaCheckCircle className="w-4 h-4" />
            </div>
            <h4 className="text-slate-900 font-bold text-xl">{String(stats?.completedJobs || 0).padStart(2, '0')}</h4>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider mt-1">Done</p>
          </div>
        </div>

        {/* Elegant Quick Actions List */}
        <div>
          <h3 className="text-slate-900 font-bold text-lg mb-3 px-1">Manage Work</h3>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div 
              onClick={() => navigate('/worker/jobs')}
              className="flex items-center justify-between p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors active:bg-slate-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                  <FaBriefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">One-Time Services</h4>
                  <p className="text-xs text-slate-500 mt-0.5">View your assigned jobs</p>
                </div>
              </div>
              <FiChevronRight className="w-5 h-5 text-slate-300" />
            </div>
            <div 
              onClick={() => navigate('/worker/projects')}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors active:bg-slate-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FaProjectDiagram className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Long-Term Projects</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Manage AMC & Maintenance</p>
                </div>
              </div>
              <FiChevronRight className="w-5 h-5 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-slate-900 font-bold text-lg">Recent Activity</h3>
            <span onClick={() => navigate('/worker/jobs')} className="text-teal-600 text-sm font-semibold cursor-pointer py-1 px-2 hover:bg-teal-50 rounded-lg transition-colors">See All</span>
          </div>
          
          {stats?.recentJobs && stats.recentJobs.length > 0 ? (
            <div className="space-y-3">
              {stats.recentJobs.map(job => (
                <div 
                  key={job?._id || Math.random()}
                  onClick={() => navigate(`/worker/job/${job?._id}`)}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                        {job?.serviceId?.categoryIcon ? (
                          <img fetchPriority="low" loading="lazy" src={job.serviceId.categoryIcon} alt="" className="w-5 h-5 object-contain" />
                        ) : (
                          <FaBriefcase className="text-slate-400 text-lg" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-bold text-sm line-clamp-1">
                          {job?.serviceId?.name || job?.serviceId?.title || job?.serviceCategory || 'Service'}
                        </h4>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-0.5 font-medium">
                          <FiMapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{typeof job?.address === 'object' ? job.address?.city : 'Location unavailable'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-900 font-bold text-sm bg-slate-50 px-2 py-1 rounded-lg">
                      ₹{job?.finalAmount || job?.basePrice || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                      <FiClock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(job?.scheduledDate)}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide uppercase ${
                      job?.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                      job?.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {String(job?.status || 'PENDING').replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <FaBriefcase className="text-slate-300 text-2xl" />
              </div>
              <h4 className="text-slate-900 font-bold mb-1">No Recent Activity</h4>
              <p className="text-slate-500 text-sm max-w-[200px]">Assigned tasks will appear here</p>
            </div>
          )}
        </div>
      </main>

      <WorkerJobAlertModal
        isOpen={!!alertJobId}
        jobId={alertJobId}
        onClose={() => setAlertJobId(null)}
        onJobAccepted={(id) => {
          fetchDashboardData();
          navigate(`/worker/job/${id}`);
        }}
      />
      
    </div>
  );
};

export default Dashboard;
