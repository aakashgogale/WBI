import React from 'react';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import { ServiceIconRenderer } from '../../../components/common/ServiceIconRenderer';

const BookingCard = ({ booking, onClick }) => {
  // Mapping Urban Company Statuses and Colors
  const getStatusDisplay = (status) => {
    const s = (status || '').toLowerCase();
    
    // Search / Unassigned
    if (['searching', 'pending', 'searching_worker'].includes(s)) {
      return {
        topText: 'Searching Technician',
        topColor: 'text-[#E57A00]',
        pillBg: 'bg-[#FDF3E6]',
        pillText: 'text-[#E57A00]',
        pillLabel: 'Searching',
        actionLabel: 'Track Search'
      };
    }

    // Assigned / Scheduled
    if (['confirmed', 'assigned', 'worker_assigned'].includes(s)) {
      return {
        topText: 'Scheduled',
        topColor: 'text-[#E57A00]',
        pillBg: 'bg-[#E5F7F5]',
        pillText: 'text-[#10AFA5]',
        pillLabel: 'Upcoming',
        actionLabel: 'Track Technician'
      };
    }

    // On The Way
    if (['journey_started', 'on_the_way', 'technician_on_the_way'].includes(s)) {
      return {
        topText: 'Technician On The Way',
        topColor: 'text-[#10AFA5]',
        pillBg: 'bg-[#E5F7F5]',
        pillText: 'text-[#10AFA5]',
        pillLabel: 'On the Way',
        actionLabel: 'Live Tracking'
      };
    }

    // Arrived
    if (['arrived', 'worker_arrived', 'visited'].includes(s)) {
      return {
        topText: 'Technician Arrived',
        topColor: 'text-[#10AFA5]',
        pillBg: 'bg-[#E5F7F5]',
        pillText: 'text-[#10AFA5]',
        pillLabel: 'Arrived',
        actionLabel: 'View Details'
      };
    }

    // In Progress
    if (['in_progress', 'in-progress', 'started'].includes(s)) {
      return {
        topText: 'In Progress',
        topColor: 'text-[#E57A00]',
        pillBg: 'bg-[#FDF3E6]',
        pillText: 'text-[#E57A00]',
        pillLabel: 'In Progress',
        actionLabel: 'View Progress'
      };
    }

    // Completed
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

    // Cancelled
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

    // Refunded
    if (['refunded'].includes(s)) {
      return {
        topText: 'Refunded',
        topColor: 'text-[#E02D3C]',
        pillBg: 'bg-[#FCECEE]',
        pillText: 'text-[#E02D3C]',
        pillLabel: 'Refunded',
        actionLabel: 'View Refund'
      };
    }

    // Fallback
    return {
      topText: 'Scheduled',
      topColor: 'text-[#E57A00]',
      pillBg: 'bg-[#E5F7F5]',
      pillText: 'text-[#10AFA5]',
      pillLabel: 'Upcoming',
      actionLabel: 'Track Status'
    };
  };

  const display = getStatusDisplay(booking.status || booking.bookingStatus);

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



  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Left Side: Image using dynamic new 3D UI */}
        <div className="w-[88px] h-[88px] shrink-0 bg-[#F8FAFC] rounded-xl flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden">
          <ServiceIconRenderer categoryName={booking.serviceName || booking.service} className="w-12 h-12" />
        </div>
        
        {/* Right Side: Content */}
        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between h-[88px]">
          <div>
            {/* Top Row: ID & Price */}
            <div className="flex justify-between items-start mb-1 leading-none">
              <p className="text-[11px] font-semibold text-slate-400 tracking-wider">
                #{booking.bookingNumber || booking.bookingId || (booking._id || booking.id).substring(0, 8)}
              </p>
              <p className="text-[15px] font-extrabold text-[#10AFA5] flex items-center leading-none">
                <span className="text-[12px] font-bold mr-0.5">₹</span>
                {(booking.finalAmount || booking.totalAmount || booking.amount || 0).toLocaleString('en-IN')}
              </p>
            </div>
            
            {/* Title */}
            <h3 className="text-[14px] font-extrabold text-slate-800 leading-[1.2] pr-2 line-clamp-1 mb-1.5 -mt-2">
              {booking.serviceName || booking.service || 'Service Request'}
            </h3>
            
            {/* Date/Time */}
            <div className="flex items-center gap-1.5 mb-1">
              <FiCalendar className="w-3 h-3 text-slate-400 shrink-0" />
              <p className="text-[11px] font-semibold text-slate-500">
                {formatDateTime(booking.scheduledDate || booking.bookingDate, booking.scheduledTime)}
              </p>
            </div>
            
            {/* Location */}
            <div className="flex items-start gap-1.5">
              <FiMapPin className="w-3 h-3 text-slate-400 shrink-0 mt-[2px]" />
              <p className="text-[11px] font-medium text-slate-500 line-clamp-1 leading-tight">
                {getAddressString(booking.address)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Row: Status Pill & Action Button */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${display.pillBg} ${display.pillText}`}>
          {display.pillLabel}
        </div>
        
        {display.topText !== display.pillLabel && (
          <p className={`text-[10px] font-extrabold ${display.topColor} whitespace-nowrap`}>
            {display.topText}
          </p>
        )}
        
        <button 
          className="px-4 py-1.5 rounded-lg border border-[#10AFA5] text-[#10AFA5] text-[11px] font-bold hover:bg-[#E5F7F5] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick(e);
          }}
        >
          {display.actionLabel}
        </button>
      </div>
    </div>
  );
};

export default React.memo(BookingCard);
