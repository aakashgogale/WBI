import React, { useState } from 'react';
import StaggerContainer from '../../../../components/common/StaggerContainer';
import StaggerItem from '../../../../components/common/StaggerItem';
import { FiChevronLeft, FiChevronRight, FiClock, FiMapPin } from 'react-icons/fi';

const mockAppointments = [
  { id: 1, title: 'House Cleaning', provider: 'Kylee Danford', time: '10:00 AM - 12:00 PM', location: '123 Main St, Indore', status: 'Upcoming' },
  { id: 2, title: 'AC Repair', provider: 'UrbanCool', time: '02:00 PM - 03:00 PM', location: '123 Main St, Indore', status: 'Pending' }
];

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(15);
  
  // Simple mock month generation
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-brand-bg min-h-screen pb-[env(safe-area-inset-bottom)] pt-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 font-poppins">Calendar</h1>
      </div>

      {/* Mock Calendar Widget */}
      <div className="bg-white rounded-[24px] p-5 shadow-purple-soft mb-6">
        <div className="flex justify-between items-center mb-4">
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
            <FiChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold">June 2026</h2>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
            <FiChevronRight size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-xs font-semibold text-gray-400">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center">
          {/* Offset for start of month mock */}
          <div className="text-gray-300 py-1">29</div>
          <div className="text-gray-300 py-1">30</div>
          <div className="text-gray-300 py-1">31</div>
          
          {days.map(day => {
            const isSelected = day === selectedDate;
            const hasBooking = [5, 12, 15, 22].includes(day);
            
            return (
              <div 
                key={day} 
                onClick={() => setSelectedDate(day)}
                className={`
                  relative flex items-center justify-center h-8 rounded-full cursor-pointer text-sm font-medium
                  ${isSelected ? 'bg-brand text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                {day}
                {hasBooking && !isSelected && (
                  <div className="absolute bottom-0 w-1 h-1 bg-brand rounded-full"></div>
                )}
                {hasBooking && isSelected && (
                  <div className="absolute bottom-0 w-1 h-1 bg-white rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointments List */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">Appointments on June {selectedDate}</h3>
      
      <StaggerContainer className="flex flex-col gap-4 pb-24">
        {mockAppointments.map((apt) => (
          <StaggerItem key={apt.id} className="bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-base font-bold text-gray-900">{apt.title}</h4>
                <p className="text-sm text-gray-500">{apt.provider}</p>
              </div>
              <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                apt.status === 'Upcoming' ? 'bg-[#00C896] text-white' : 'bg-[#FFB800] text-white'
              }`}>
                {apt.status}
              </div>
            </div>
            
            <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                <FiClock className="text-brand" /> {apt.time}
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                <FiMapPin className="text-brand" /> {apt.location}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
};

export default Calendar;
