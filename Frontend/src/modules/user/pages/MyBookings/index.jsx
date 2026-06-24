import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiHeadphones, FiClock } from 'react-icons/fi';
// toast removed
import { motion } from 'framer-motion';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useIntersection } from 'react-use';
import NotificationBell from '../../components/common/NotificationBell';
import { bookingService } from '../../../../services/bookingService';
import { useSocket } from '../../../../context/SocketContext';
import BookingCard from './components/BookingCard';

// Need Help Component
const SupportCard = () => (
  <div className="mt-6 mb-8 px-4">
    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-[#E2E8F0]">
          <FiHeadphones className="w-5 h-5 text-[#10AFA5]" />
        </div>
        <div>
          <h4 className="text-[14px] font-extrabold text-slate-900 leading-tight">Need Help?</h4>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">Our support team is here to help you.</p>
        </div>
      </div>
      <button className="px-4 py-2 bg-[#10AFA5] text-white text-[12px] font-bold rounded-xl whitespace-nowrap active:scale-95 transition-transform shadow-[0_4px_10px_rgba(16,175,165,0.25)]">
        Contact Support
      </button>
    </div>
  </div>
);

// Trust Badges Component
const TrustBadges = () => (
  <div className="px-4 pb-10">
    <div className="flex justify-between items-center border-t border-slate-100 pt-6">
      {[
        { title: 'Verified Experts', subtitle: 'Trusted professionals', icon: '/assets/icons/verified.png' },
        { title: 'Upfront Pricing', subtitle: 'No hidden charges', icon: '/assets/icons/pricing.png' },
        { title: 'Service Warranty', subtitle: 'Assured support', icon: '/assets/icons/warranty.png' },
        { title: 'On-time Service', subtitle: 'Punctual & reliable', icon: '/assets/icons/ontime.png' },
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center text-center w-1/4 px-1">
          <div className="w-6 h-6 mb-1.5 opacity-80">
            {/* Fallback to simple circle if image not found to keep layout stable */}
            <div className="w-full h-full bg-[#E5F7F5] rounded-full flex items-center justify-center">
               <div className="w-3 h-3 border-2 border-[#10AFA5] rounded-sm"></div>
            </div>
          </div>
          <p className="text-[9px] font-extrabold text-slate-800 leading-[1.1] mb-0.5">{item.title}</p>
          <p className="text-[7px] font-medium text-slate-400 leading-[1.1]">{item.subtitle}</p>
        </div>
      ))}
    </div>
  </div>
);

const MyBookings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [filter, setFilter] = useState('all');

  // React Query for Infinite Loading Bookings
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: queryStatus,
  } = useInfiniteQuery({
    queryKey: ['myBookings', filter],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { page: pageParam, limit: 10 };
      if (filter !== 'all') {
        if (filter === 'upcoming') {
          params.status = 'searching,confirmed,in_progress,in-progress,journey_started,visited';
        } else {
          params.status = filter;
        }
      }
      return await bookingService.getUserBookings(params);
    },
    getNextPageParam: (lastPage) => {
      // Handle missing pagination data robustly
      if (!lastPage || !lastPage.pagination) return undefined;
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Extract bookings from infinite query data structure
  const bookings = useMemo(() => {
    return data?.pages.flatMap((page) => page.data || []) || [];
  }, [data]);

  // Socket.IO Real-time Updates
  useEffect(() => {
    if (!socket) return;

    const handleBookingUpdate = () => {
      // Invalidate the query cache to trigger a refetch of the currently visible bookings
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      // We could also do an optimistic update, but invalidation is safer for pagination consistency
    };

    socket.on('bookingUpdated', handleBookingUpdate);
    socket.on('workerAssigned', handleBookingUpdate);
    socket.on('workerStarted', handleBookingUpdate);
    socket.on('workerArrived', handleBookingUpdate);
    socket.on('serviceCompleted', handleBookingUpdate);
    socket.on('paymentCompleted', handleBookingUpdate);

    return () => {
      socket.off('bookingUpdated', handleBookingUpdate);
      socket.off('workerAssigned', handleBookingUpdate);
      socket.off('workerStarted', handleBookingUpdate);
      socket.off('workerArrived', handleBookingUpdate);
      socket.off('serviceCompleted', handleBookingUpdate);
      socket.off('paymentCompleted', handleBookingUpdate);
    };
  }, [socket, queryClient]);

  // Infinite Scroll Intersection Observer
  const loadMoreRef = useRef(null);
  const intersection = useIntersection(loadMoreRef, {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
  });

  useEffect(() => {
    if (intersection && intersection.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [intersection, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Calculate dynamic counts (if backend supports it, otherwise approximate from currently loaded)
  // Since we rely on infinite scroll, we show static labels without dynamic totals unless the API returns overall totals
  const tabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom)] bg-[#F8FAFC] relative">
      <div className="relative z-10">
        
        {/* Header */}
        <header className="pt-6 pb-2 px-4 flex items-center justify-between bg-white">
          <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <div className="flex items-center gap-3">
            <button className="text-slate-600 p-1">
              <FiSearch className="w-5 h-5" />
            </button>
            <div className="relative flex items-center justify-center p-1">
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Filter Tabs (Urban Company style pill shape) */}
        <div className="bg-white sticky top-0 z-20 px-4 py-3 pb-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex w-full bg-slate-50 p-1 rounded-[16px] border border-slate-100/80">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 py-2 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-all duration-200 ${
                  filter === tab.id
                    ? 'bg-[#10AFA5] text-white shadow-sm'
                    : 'bg-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List Area */}
        <main className="px-4 pt-4 pb-2 w-full">
          {queryStatus === 'pending' ? (
            // Skeleton Loader
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[20px] p-4 border border-slate-100 flex gap-4">
                  <div className="w-[88px] h-[88px] shrink-0 bg-slate-100 rounded-xl animate-pulse"></div>
                  <div className="flex-1 py-1 flex flex-col justify-between">
                    <div>
                      <div className="h-3 bg-slate-100 rounded w-full mb-2 animate-pulse"></div>
                      <div className="h-4 bg-slate-100 rounded w-2/3 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-5 bg-slate-100 rounded-full w-16 animate-pulse"></div>
                      <div className="h-7 bg-slate-100 rounded-lg w-24 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : queryStatus === 'error' ? (
            <div className="text-center py-10 text-red-500 font-medium">
              Failed to load bookings. Please try again.
            </div>
          ) : bookings.length === 0 ? (
            // Empty State
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center px-6"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-sm border border-slate-100">
                <FiClock className="w-8 h-8 text-[#10AFA5] opacity-50" />
              </div>
              <h3 className="text-slate-900 text-[18px] font-extrabold mb-1">No Bookings Found</h3>
              <p className="text-slate-500 text-[13px] max-w-xs font-medium">
                {filter === 'all'
                  ? "You haven't booked any services yet."
                  : `You don't have any ${filter} bookings at the moment.`}
              </p>
            </motion.div>
          ) : (
            // Render Bookings
            <div className="space-y-3.5">
              {bookings.map((booking, idx) => (
                <motion.div
                  key={booking._id || booking.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <BookingCard 
                    booking={booking} 
                    onClick={() => navigate(`/user/booking/${booking._id || booking.id}`)}
                  />
                </motion.div>
              ))}
              
              {/* Infinite Scroll Trigger */}
              <div ref={loadMoreRef} className="py-4 flex justify-center">
                {isFetchingNextPage ? (
                  <div className="w-6 h-6 border-2 border-[#10AFA5] border-t-transparent rounded-full animate-spin"></div>
                ) : hasNextPage ? (
                  <span className="text-transparent">Load More</span>
                ) : (
                  <span className="text-[12px] font-medium text-slate-400">No more bookings</span>
                )}
              </div>
            </div>
          )}
        </main>

        <SupportCard />
        <TrustBadges />

      </div>
    </div>
  );
};

export default MyBookings;
