import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiChevronRight } from 'react-icons/fi';
import { OptimizedImage } from '../../../../../components/common';
import { bookingService } from '../../../../../services/bookingService';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'https://app.wbinfs.com').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const RecentBookings = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBooking = async () => {
      try {
        // Fetch the most recent booking for the user
        const response = await bookingService.getUserBookings({ limit: 1 });
        const bookingsList = Array.isArray(response?.data) 
          ? response.data 
          : (response?.data?.bookings || []);
          
        if (response?.success && bookingsList.length > 0) {
          setBooking(bookingsList[0]);
        }
      } catch (error) {
        console.error('Failed to fetch recent bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBooking();
  }, []);

  if (loading) {
    return (
      <div className="mb-4 px-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 bg-slate-200 rounded animate-pulse w-48"></div>
        </div>
        <div className="w-full h-[88px] bg-slate-100 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!booking) {
    return null; // Don't show anything if there are no recent bookings
  }

  // Format date
  const dateObj = new Date(booking.scheduledDate || booking.createdAt);
  const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  // Format time
  let formattedTime = booking.scheduledTime || dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (booking.timeSlot?.start) {
    formattedTime = booking.timeSlot.start;
  }

  // Status mapping to colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'work_done':
        return 'bg-[#E6F4EA] text-[#137333]';
      case 'cancelled':
        return 'bg-red-50 text-red-600';
      case 'pending':
      case 'searching_worker':
        return 'bg-amber-50 text-amber-600';
      default:
        return 'bg-blue-50 text-blue-600';
    }
  };

  const getStatusText = (status) => {
    if (status === 'work_done') return 'Completed';
    if (status === 'searching_worker') return 'Searching';
    return status?.charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ') || 'Pending';
  };

  // Get image URL
  const imageUrl = booking.categoryIcon || booking.serviceIcon || (booking.serviceId && booking.serviceId.iconUrl) || '';

  return (
    <div className="mb-4 px-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-bold text-[#0F172A] tracking-tight">
          Recent Bookings
        </h2>
        <button 
          className="text-[14px] font-semibold text-[#10AFA5] hover:opacity-80 transition-opacity flex items-center gap-0.5 cursor-pointer"
          onClick={() => navigate('/user/bookings')}
        >
          See All <span className="text-[12px] font-bold">&gt;</span>
        </button>
      </div>

      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/user/booking/${booking._id}`)}
        className="bg-white rounded-2xl border border-slate-100 p-3.5 cursor-pointer relative flex items-center justify-between gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-all duration-300"
      >
        {/* Left Section: Service Icon & Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 bg-slate-50 border border-slate-100/80 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
            {imageUrl ? (
              <OptimizedImage 
                src={toAssetUrl(imageUrl)} 
                alt="Service Icon" 
                className="w-8 h-8 object-contain mix-blend-multiply"
                onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/4836/4836952.png' }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#10AFA5]/10 flex items-center justify-center">
                <span className="text-[#10AFA5] font-bold text-base">{booking.serviceName?.charAt(0) || 'S'}</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-slate-800 truncate leading-tight">
              {booking.serviceName || 'Home Service'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-medium truncate leading-none">
              Booking ID: #{booking.bookingNumber || booking._id.slice(-6).toUpperCase()}
            </p>
            <div className="mt-1.5 flex items-center">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Schedule, Price & Arrow */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Schedule Stack */}
          <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3 h-8">
            <FiCalendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="flex flex-col text-left justify-center">
              <span className="text-[11px] font-semibold text-slate-700 leading-tight whitespace-nowrap">{formattedDate}</span>
              <span className="text-[9px] text-slate-400 leading-tight mt-0.5 whitespace-nowrap">{formattedTime}</span>
            </div>
          </div>
          
          {/* Price & Chevron */}
          <div className="flex items-center gap-1 pl-1">
            <span className="text-[14px] font-extrabold text-slate-800">
              ₹{booking.finalAmount || booking.amount || 0}
            </span>
            <FiChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RecentBookings;
