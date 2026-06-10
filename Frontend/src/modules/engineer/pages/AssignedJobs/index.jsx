import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiFilter, FiChevronRight, FiMapPin, FiClock } from 'react-icons/fi';
import engineerService from '../../../../services/engineerService';
import { SkeletonList } from '../../../../components/common/SkeletonLoaders';

const AssignedJobs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({ all: 0, assigned: 0, in_progress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'assigned', 'in_progress', 'completed'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchJobs = async (pageNum, statusFilter, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);

      const response = await engineerService.getAssignedJobs({
        page: pageNum,
        limit: 10,
        status: statusFilter
      });

      if (response.success) {
        if (append) {
          setJobs(prev => [...prev, ...response.data]);
        } else {
          setJobs(response.data);
        }
        
        if (response.counts) {
          setCounts(response.counts);
        }
        
        setHasMore(response.pagination.page < response.pagination.pages);
      }
    } catch (err) {
      console.error('Fetch jobs error:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Reset and fetch when filter changes
    setPage(1);
    setJobs([]);
    setHasMore(true);
    fetchJobs(1, filter, false);
  }, [filter]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchJobs(nextPage, filter, true);
    }
  }, [loadingMore, hasMore, page, filter]);

  const lastJobElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, loadMore]);

  // Handle global update event
  useEffect(() => {
    const handleUpdate = () => {
      setPage(1);
      fetchJobs(1, filter, false);
    };
    window.addEventListener('workerJobsUpdated', handleUpdate);
    return () => window.removeEventListener('workerJobsUpdated', handleUpdate);
  }, [filter]);

  const getStatusConfig = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'assigned':
      case 'confirmed':
      case 'accepted':
        return { label: 'Assigned', bg: 'bg-[#16A34A]', text: 'text-white' };
      case 'in_progress':
      case 'journey_started':
      case 'visited':
      case 'on_the_way':
      case 'started':
      case 'reached':
        return { label: 'In Progress', bg: 'bg-[#F97316]', text: 'text-white' };
      case 'completed':
      case 'work_done':
      case 'paid':
      case 'worker_paid':
        return { label: 'Completed', bg: 'bg-[#64748B]', text: 'text-white' };
      case 'pending':
        return { label: 'New', bg: 'bg-[#0D9488]', text: 'text-white' };
      case 'cancelled':
      case 'rejected':
        return { label: 'Cancelled', bg: 'bg-[#EF4444]', text: 'text-white' };
      default:
        return { label: status, bg: 'bg-[#64748B]', text: 'text-white' };
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, ${timeStr}`;
    }
  };

  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'assigned', label: 'Assigned', count: counts.assigned },
    { id: 'in_progress', label: 'In Progress', count: counts.in_progress },
    { id: 'completed', label: 'Completed', count: counts.completed }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans ">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm px-4 h-14 flex items-center justify-between">
        <button 
          onClick={() => navigate('/engineer/dashboard')} 
          className="p-2 -ml-2 text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
        >
          {/* Hamburger Icon as per design */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">My Jobs</h1>
        <button className="p-2 -mr-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
          <FiFilter className="w-5 h-5" />
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-14 z-30">
        <div className="flex overflow-x-auto scrollbar-hide px-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-shrink-0 px-4 py-3.5 text-sm font-semibold relative transition-colors ${
                filter === tab.id ? 'text-[#0D9488]' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label} ({tab.count})
              {filter === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D9488] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <main className="px-4 py-4">
        {loading && page === 1 ? (
          <SkeletonList count={5} cardHeight="120px" />
        ) : error ? (
          <div className="text-center py-12 text-red-500 bg-white rounded-2xl border border-red-100 shadow-sm">
            <p className="font-semibold">{error}</p>
            <button 
              onClick={() => fetchJobs(1, filter, false)}
              className="mt-3 text-sm font-bold text-teal-600 hover:text-teal-700"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-slate-900 font-bold mb-1">No jobs found</h3>
            <p className="text-slate-500 text-sm">You have no {filter !== 'all' ? filter.replace('_', ' ') : ''} jobs.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, index) => {
              const statusConfig = getStatusConfig(job.status);
              const isLastElement = jobs.length === index + 1;

              return (
                <div
                  key={job._id}
                  ref={isLastElement ? lastJobElementRef : null}
                  onClick={() => navigate(`/engineer/job/${job._id}`)}
                  className="bg-white rounded-[1.25rem] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex gap-4">
                    {/* Left Icon Area */}
                    <div className="w-14 h-14 bg-[#F0FDFA] rounded-2xl flex items-center justify-center shrink-0 border border-teal-50">
                      {job.serviceId?.categoryIcon ? (
                        <img src={job.serviceId.categoryIcon} alt="service" className="w-7 h-7 object-contain opacity-90" />
                      ) : job.serviceId?.iconUrl ? (
                        <img src={job.serviceId.iconUrl} alt="service" className="w-7 h-7 object-contain opacity-90" />
                      ) : (
                        <div className="w-7 h-7 flex items-center justify-center rounded-lg text-[#0D9488]">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                             <path d="M16 7A4 4 0 118 7a4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           </svg>
                        </div>
                      )}
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between ml-1">
                      {/* Title & Badge */}
                      <div className="flex justify-between items-start gap-2 mb-0.5">
                        <h3 className="font-bold text-[#0F172A] text-[15px] leading-tight line-clamp-1">
                          {job.serviceName || job.serviceId?.title || 'Service Task'}
                        </h3>
                        <span className={`${statusConfig.bg} ${statusConfig.text} text-[10px] font-bold px-2 py-0.5 rounded tracking-wide shrink-0`}>
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Location & Arrow */}
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {/* If we want to show a small person icon for assigned vendor or user, we can, but let's stick to text */}
                          <p className="text-[#64748B] text-xs font-medium truncate">
                            {job.address?.city ? `${job.address.addressLine1 ? job.address.addressLine1 + ', ' : ''}${job.address.city}` : 'Location unavailable'}
                          </p>
                        </div>
                        <FiChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>

                      {/* Price & Date */}
                      <div className="flex justify-between items-center mt-1">
                        <div className="font-extrabold text-[#0F172A] text-sm">
                          ₹{job.finalAmount || job.basePrice || 0}
                        </div>
                        <div className="text-[#64748B] text-[11px] font-medium">
                          {formatTime(job.scheduledDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {loadingMore && (
              <div className="py-4 flex justify-center">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AssignedJobs;
