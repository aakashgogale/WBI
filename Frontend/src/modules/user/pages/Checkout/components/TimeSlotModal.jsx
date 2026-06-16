import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiInfo } from 'react-icons/fi';

const TimeSlotModal = ({
  isOpen,
  onClose,
  availableDates = [],
  isLoading = false,
  onSave,
  fetchSlots,
  selectedDate,
  selectedTime
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  
  // Local state for selections before saving
  const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate || null);
  const [localSelectedTime, setLocalSelectedTime] = useState(selectedTime || null);
  const [localSelectedSlotId, setLocalSelectedSlotId] = useState(null);
  
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (!localSelectedDate && availableDates.length > 0) {
        handleDateSelect(availableDates[0]);
      } else if (localSelectedDate) {
        handleDateSelect(localSelectedDate);
      }
    } else {
      document.body.style.overflow = '';
      setIsClosing(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, availableDates]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleDateSelect = async (date) => {
    setLocalSelectedDate(date);
    setCurrentMonthDate(date);
    setLocalSelectedTime(null);
    setLocalSelectedSlotId(null);
    
    if (fetchSlots) {
      setLoadingSlots(true);
      try {
        const slots = await fetchSlots(date);
        setTimeSlots(slots);
      } catch (error) {
        console.error("Failed to load slots", error);
      } finally {
        setLoadingSlots(false);
      }
    }
  };

  const nextMonth = () => {
    const next = new Date(currentMonthDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonthDate(next);
  };

  const prevMonth = () => {
    const prev = new Date(currentMonthDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonthDate(prev);
  };

  if (!isOpen && !isClosing) return null;

  // Filter dates for current viewing month
  const datesInView = availableDates.filter(d => 
    d.getMonth() === currentMonthDate.getMonth() && 
    d.getFullYear() === currentMonthDate.getFullYear()
  );

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div
          className={`bg-white rounded-t-3xl ${isClosing ? 'animate-slide-down' : 'animate-slide-up'} flex flex-col`}
          style={{ maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4 shrink-0">
            <button onClick={handleClose} className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full">
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[17px] font-bold text-[#0F172A]">{monthName}</h2>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full">
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full">
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-5 overflow-y-auto pb-6 scrollbar-hide">
            {/* Dates Row */}
            {isLoading ? (
              <div className="py-4 flex justify-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#10AFA5] rounded-full animate-spin"></div></div>
            ) : datesInView.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">No dates available in this month</div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {datesInView.map((date, idx) => {
                  const isSelected = localSelectedDate && date.toDateString() === localSelectedDate.toDateString();
                  const dayName = date.toLocaleString('default', { weekday: 'short' });
                  const dateNum = date.getDate();
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleDateSelect(date)}
                      className={`flex flex-col items-center justify-center shrink-0 w-[52px] snap-center transition-all ${
                        isSelected ? 'scale-105' : 'opacity-80'
                      }`}
                    >
                      <span className={`text-[13px] font-medium mb-2 ${isSelected ? 'text-[#0F172A]' : 'text-gray-400'}`}>
                        {dayName}
                      </span>
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold transition-colors ${
                        isSelected 
                          ? 'bg-[#10AFA5] text-white shadow-md' 
                          : 'bg-transparent text-[#0F172A]'
                      }`}>
                        {dateNum}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Time Slots */}
            <div className="mt-4">
              <h3 className="text-[15px] font-bold text-[#0F172A] mb-4">Select Time Slot</h3>
              
              {loadingSlots ? (
                <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#10AFA5] rounded-full animate-spin"></div></div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">No slots available for this date</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((slot, idx) => {
                    const timeDisplay = slot.time.split(' - ')[0]; // Just show start time "09:00 AM"
                    const isSelected = localSelectedSlotId === slot.id;
                    
                    return (
                      <button
                        key={idx}
                        disabled={!slot.isAvailable}
                        onClick={() => {
                          setLocalSelectedSlotId(slot.id);
                          setLocalSelectedTime(slot.time);
                        }}
                        className={`py-3 rounded-xl text-[13px] font-bold transition-all border ${
                          !slot.isAvailable 
                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                            : isSelected
                              ? 'bg-[#F1FAF9] border-[#10AFA5] text-[#10AFA5]'
                              : 'bg-white border-gray-100 text-[#64748B] hover:border-gray-200'
                        }`}
                      >
                        {timeDisplay}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-[#F8FAFC] rounded-xl p-3 flex items-center gap-3">
              <FiInfo className="text-gray-400 w-4 h-4 shrink-0" />
              <p className="text-[13px] text-gray-500">You will be notified before arrival</p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onSave(localSelectedDate, localSelectedTime, localSelectedSlotId)}
              disabled={!localSelectedDate || !localSelectedSlotId}
              className={`w-full mt-6 py-4 rounded-xl text-[15px] font-bold transition-all ${
                localSelectedDate && localSelectedSlotId
                  ? 'bg-[#10AFA5] text-white shadow-md active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimeSlotModal;
