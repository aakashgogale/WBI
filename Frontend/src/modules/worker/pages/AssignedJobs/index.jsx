import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiFilter, FiChevronRight, FiMapPin, FiClock, FiSearch } from 'react-icons/fi';
import workerService from '../../../../services/workerService';
import { SkeletonList } from '../../../../components/common/SkeletonLoaders';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const AssignedJobs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState('all'); // 'all', 'assigned', 'in_progress', 'completed'
  const observer = useRef();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey: ['workerAssignedJobs', filter],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await workerService.getAssignedJobs({
        page: pageParam,
        limit: 10,
        status: filter
      });
      if (!response.success) throw new Error('Failed to fetch jobs');
      return {
        jobs: response.jobs || response.data || [],
        pagination: response.pagination || { page: 1, pages: 1 },
        counts: response.counts || { all: 0, assigned: 0, in_progress: 0, completed: 0 }
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });

  const jobs = useMemo(() => {
    return data ? data.pages.flatMap(page => page.jobs) : [];
  }, [data]);

  const counts = data?.pages[0]?.counts || { all: 0, assigned: 0, in_progress: 0, completed: 0 };
  const loading = status === 'pending';

  const lastJobElementRef = useCallback(node => {
    if (isFetchingNextPage || loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, loading, hasNextPage, fetchNextPage]);

  // Handle global update event
  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries(['workerAssignedJobs']);
    };
    window.addEventListener('workerJobsUpdated', handleUpdate);
    return () => window.removeEventListener('workerJobsUpdated', handleUpdate);
  }, [queryClient]);

  const getStatusConfig = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'assigned':
      case 'confirmed':
      case 'accepted':
      case 'worker_assigned':
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
    if (isNaN(date.getTime())) return 'N/A'; // Prevent RangeError crash
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
    { id: 'all', label: 'All', count: counts?.all || 0 },
    { id: 'assigned', label: 'Assigned', count: counts?.assigned || 0 },
    { id: 'in_progress', label: 'In Progress', count: counts?.in_progress || counts?.inProgress || 0 }, // Backend sends inProgress
    { id: 'completed', label: 'Completed', count: counts?.completed || 0 }
  ];

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const displayedJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const title = String(job.serviceName || job.serviceId?.title || '').toLowerCase();
    const city = String(job.address?.city || '').toLowerCase();
    const bookingNumber = String(job.bookingNumber || '').toLowerCase();
    const status = String(getStatusConfig(job.status).label || '').toLowerCase();
    return title.includes(searchQuery) || city.includes(searchQuery) || bookingNumber.includes(searchQuery) || status.includes(searchQuery);
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans ">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm px-4 h-14 flex items-center justify-between">
        <button 
          onClick={() => navigate('/worker/dashboard')} 
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
        {loading ? (
          <SkeletonList count={5} cardHeight="120px" />
        ) : error ? (
          <div className="text-center py-12 text-red-500 bg-white rounded-2xl border border-red-100 shadow-sm">
            <p className="font-semibold">{error?.message || 'Failed to load jobs'}</p>
            <button 
              onClick={() => queryClient.invalidateQueries(['workerAssignedJobs'])}
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
        ) : displayedJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-bold mb-1">No matching jobs found</h3>
            <p className="text-slate-500 text-sm">Try searching with a different keyword.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {searchQuery && (
              <div className="text-sm text-gray-500 font-medium mb-2 pl-2">
                Showing results for "<span className="text-gray-900">{searchQuery}</span>"
              </div>
            )}
            {displayedJobs.map((job, index) => {
              const statusConfig = getStatusConfig(job.status);
              const isLastElement = displayedJobs.length === index + 1;

              return (
                <div
                  key={job._id}
                  ref={isLastElement ? lastJobElementRef : null}
                  onClick={() => navigate(`/worker/job/${job._id}`)}
                  className="bg-white rounded-[1.25rem] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex gap-4">
                    {/* Left Icon Area */}
                    <div className="w-14 h-14 bg-[#F0FDFA] rounded-2xl flex items-center justify-center shrink-0 border border-teal-50">
                      {job.serviceId?.categoryIcon ? (
                        <img fetchPriority="low" loading="lazy" src={job.serviceId.categoryIcon} alt="service" className="w-7 h-7 object-contain opacity-90" />
                      ) : job.serviceId?.iconUrl ? (
                        <img fetchPriority="low" loading="lazy" src={job.serviceId.iconUrl} alt="service" className="w-7 h-7 object-contain opacity-90" />
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

            {isFetchingNextPage && (
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
