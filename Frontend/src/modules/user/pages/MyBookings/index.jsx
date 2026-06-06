import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiCalendar, FiMapPin, FiHeadphones, FiUsers, FiTag, FiShield, FiTruck, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import NotificationBell from '../../components/common/NotificationBell';
import { bookingService } from '../../../../services/bookingService';
import { getServiceImage, getFallbackImage } from '../../../../utils/serviceImages';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filter !== 'all') {
          if (filter === 'upcoming') {
            params.status = 'searching,confirmed,in_progress,in-progress,journey_started,visited';
          } else {
            params.status = filter;
          }
        }
        const response = await bookingService.getUserBookings(params);
        if (response.success) {
          setBookings(response.data || []);
        } else {
          toast.error(response.message || 'Failed to load bookings');
          setBookings([]);
        }
      } catch (error) {
        toast.error('Failed to load bookings. Please try again.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();

    window.addEventListener('userBookingsUpdated', loadBookings);
    return () => {
      window.removeEventListener('userBookingsUpdated', loadBookings);
    };
  }, [filter]);

  const getStatusDisplay = (status) => {
    const s = (status || '').toLowerCase();
    
    if (['completed', 'work_done'].includes(s)) {
      return {
        topText: 'Completed',
        topColor: 'text-[#05A660]',
        pillBg: 'bg-[#EAF8F1]',
        pillText: 'text-[#05A660]',
        pillLabel: 'Completed',
        actionLabel: 'View Details'
      };
    }
    
    if (['cancelled', 'rejected'].includes(s)) {
      return {
        topText: 'Cancelled',
        topColor: 'text-[#E02D3C]',
        pillBg: 'bg-[#FCECEE]',
        pillText: 'text-[#E02D3C]',
        pillLabel: 'Cancelled',
        actionLabel: 'Book Again'
      };
    }
    
    if (['in_progress', 'in-progress', 'journey_started', 'visited'].includes(s)) {
      return {
        topText: 'In Progress',
        topColor: 'text-[#E57A00]',
        pillBg: 'bg-[#FDF3E6]',
        pillText: 'text-[#E57A00]',
        pillLabel: 'In Progress',
        actionLabel: 'Track Status'
      };
    }
    
    // Default to Upcoming/Scheduled
    return {
      topText: 'Scheduled',
      topColor: 'text-[#E57A00]',
      pillBg: 'bg-[#E5F7F5]',
      pillText: 'text-[#10AFA5]',
      pillLabel: 'Upcoming',
      actionLabel: 'Track Status'
    };
  };

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const time = timeStr || 'N/A';
    return `${day} ${month} ${year} • ${time}`;
  };

  const getAddressString = (address) => {
    if (typeof address === 'string') return address;
    if (address && typeof address === 'object') {
      const parts = [
        address.addressLine1,
        address.addressLine2,
        address.city
      ].filter(Boolean);
      return parts.join(', ');
    }
    return 'Detailed Address';
  };

  const getImageUrl = (booking) => {
    // 1. Production Rule: Always use the actual uploaded service image if it exists
    if (booking.serviceImages && booking.serviceImages.length > 0) {
      const img = booking.serviceImages[0];
      if (typeof img === 'string' && img.startsWith('http')) return img;
    }
    
    // 2. Production Fallback: Unsplash Image Mapping
    return getServiceImage(booking.serviceName, booking.serviceCategory);
  };

  const handleBookingClick = (booking) => {
    navigate(`/user/booking/${booking._id || booking.id}`);
  };

  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom)] bg-white relative">
      <div className="relative z-10 pb-20">
        {/* Header */}
        <header className="pt-6 pb-2 px-4 flex items-center justify-between">
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

        {/* Filter Tabs */}
        <div className="bg-white sticky top-0 z-20 px-4 py-3 pb-4">
          <div className="flex w-full bg-slate-50 p-1 rounded-full border border-slate-100">
            {[
              { id: 'all', label: 'All Bookings' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all duration-200 ${
                  filter === tab.id
                    ? 'bg-brand text-white shadow-sm'
                    : 'bg-transparent text-slate-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <main className="px-4 w-full">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm animate-pulse flex gap-4">
                  <div className="w-24 h-24 shrink-0 bg-slate-100 rounded-2xl"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-6 bg-slate-100 rounded-full w-16"></div>
                      <div className="h-8 bg-slate-100 rounded-lg w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center px-6"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <FiClock className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 text-lg font-bold mb-1">No Bookings Found</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                {filter === 'all'
                  ? "You haven't booked any services yet."
                  : `You don't have any ${filter} bookings at the moment.`}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const display = getStatusDisplay(booking.status);
                const imageUrl = getImageUrl(booking);
                
                return (
                <motion.div
                  key={booking._id || booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleBookingClick(booking)}
                  className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 shrink-0 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                      <img 
                        src={imageUrl} 
                        alt={booking.serviceName || 'Service'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getFallbackImage();
                        }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                      <div>
                        {/* Top Row: ID & Price */}
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[11px] font-semibold text-slate-400 tracking-wider">
                            #{booking.bookingNumber || (booking._id || booking.id).substring(0, 8)}
                          </p>
                          <p className="text-[15px] font-extrabold text-brand flex items-center">
                            <span className="text-[12px] font-bold mr-0.5">₹</span>
                            {(booking.finalAmount || booking.totalAmount || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                        
                        {/* Second Row: Title & Top Status */}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-[14px] font-extrabold text-slate-800 leading-[1.2] pr-2 line-clamp-2">
                            {booking.serviceName || 'Service Request'}
                          </h3>
                          <p className={`text-[10px] font-extrabold ${display.topColor} whitespace-nowrap mt-0.5 tracking-wide`}>
                            {display.topText}
                          </p>
                        </div>
                        
                        {/* Date/Time */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <FiCalendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <p className="text-[11px] font-semibold text-slate-500">
                            {formatDateTime(booking.scheduledDate, booking.scheduledTime)}
                          </p>
                        </div>
                        
                        {/* Location */}
                        <div className="flex items-start gap-1.5 mb-3.5">
                          <FiMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] font-medium text-slate-500 line-clamp-1">
                            {getAddressString(booking.address)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Bottom Row: Pill & Button */}
                      <div className="flex justify-between items-center mt-auto">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${display.pillBg} ${display.pillText}`}>
                          {display.pillLabel}
                        </div>
                        <button className="px-3 py-1.5 rounded-lg border border-brand text-brand text-[11px] font-bold hover:bg-brand-bg transition-colors">
                          {display.actionLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}
        </main>

        {/* Need Help Section */}
        <div className="mt-8 mx-4 p-4 bg-[#EAF8F1] rounded-[20px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-[#bce8d4]">
              <FiHeadphones className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h4 className="text-[15px] font-extrabold text-slate-900 mb-0.5">Need Help?</h4>
              <p className="text-[11px] font-medium text-slate-600">Our support team is here to help you.</p>
            </div>
          </div>
          <button className="px-4 py-2.5 bg-brand text-white text-[12px] font-bold rounded-xl whitespace-nowrap active:scale-95 transition-transform shadow-[0_4px_10px_rgba(16,175,165,0.3)]">
            Contact Support
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 px-4">
          <div className="grid grid-cols-4 gap-1 border-t border-slate-100 pt-6">
            <div className="flex flex-col items-center text-center">
              <FiUsers className="w-5 h-5 mb-1.5 text-brand" />
              <p className="text-[9px] font-extrabold text-slate-800 leading-tight mb-0.5">Verified Experts</p>
              <p className="text-[7px] font-medium text-slate-400 leading-tight">Trusted professionals</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <FiTag className="w-5 h-5 mb-1.5 text-brand" />
              <p className="text-[9px] font-extrabold text-slate-800 leading-tight mb-0.5">Upfront Pricing</p>
              <p className="text-[7px] font-medium text-slate-400 leading-tight">No hidden charges</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <FiShield className="w-5 h-5 mb-1.5 text-brand" />
              <p className="text-[9px] font-extrabold text-slate-800 leading-tight mb-0.5">Service Warranty</p>
              <p className="text-[7px] font-medium text-slate-400 leading-tight">Assured support</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <FiTruck className="w-5 h-5 mb-1.5 text-brand" />
              <p className="text-[9px] font-extrabold text-slate-800 leading-tight mb-0.5">On-time Service</p>
              <p className="text-[7px] font-medium text-slate-400 leading-tight">Punctual & reliable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
