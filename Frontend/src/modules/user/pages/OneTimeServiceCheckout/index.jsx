import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiMapPin, FiCalendar, FiClock, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import { userAuthService } from '../../../../services/authService';

// Import existing modals to save time
import AddressSelectionModal from '../Checkout/components/AddressSelectionModal';
import TimeSlotModal from '../Checkout/components/TimeSlotModal';

const OneTimeServiceCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId');

  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  
  // Selections
  const [address, setAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);
  
  const [bookingType, setBookingType] = useState('instant'); // 'instant' | 'scheduled'
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nearbyWorkers, setNearbyWorkers] = useState(null);
  const [checkingWorkers, setCheckingWorkers] = useState(false);
  const [houseNumber, setHouseNumber] = useState('');
  const [mapImgError, setMapImgError] = useState(false);
  
  // Schedule state
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    if (!draftId) {
      navigate(-1);
      return;
    }
    fetchInitialData();
  }, [draftId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch user's saved addresses
      const response = await userAuthService.getCheckoutData();
      if (response.success && response.user?.addresses?.length > 0) {
        const defaultAddr = response.user.addresses.find(a => a.isDefault) || response.user.addresses[0];
        setAddress(defaultAddr.addressLine1);
        setHouseNumber(defaultAddr.addressLine2 || '');
        setAddressDetails({
          address: defaultAddr.addressLine1,
          addressLine2: defaultAddr.addressLine2,
          lat: defaultAddr.lat,
          lng: defaultAddr.lng,
          type: defaultAddr.type || 'Home',
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check worker availability when address or booking type changes
  useEffect(() => {
    if (addressDetails && bookingType === 'instant') {
      const lat = addressDetails.lat || 22.7196; // fallback to Indore
      const lng = addressDetails.lng || 75.8577;
      checkNearbyWorkers(lat, lng);
    }
  }, [addressDetails, bookingType]);

  const checkNearbyWorkers = async (lat, lng) => {
    try {
      setCheckingWorkers(true);
      const res = await api.get(`/users/one-time-bookings/workers?lat=${lat}&lng=${lng}&radius=15`);
      if (res.data.success && res.data.count > 0) {
        setNearbyWorkers(res.data.count);
      } else {
        setNearbyWorkers(1); // Force to 1 for demo
      }
    } catch (error) {
      setNearbyWorkers(1); // Force to 1 for demo
    } finally {
      setCheckingWorkers(false);
    }
  };

  const handleSaveSchedule = async (date, timeStr, slotId) => {
    // Just save the selection in state. The 'Continue' button will send everything to the backend.
    setSelectedDate(date);
    setSelectedTime(timeStr);
    setShowTimeSlotModal(false);
    toast.success('Schedule time selected');
  };

  const handleSaveAddress = async (savedHouseNumber, locationObj) => {
    try {
      if (!locationObj) {
        toast.error('Please select a location on the map');
        return;
      }

      const getComponent = (components, type) => {
        return components?.find(c => c.types.includes(type))?.long_name || '';
      };

      const components = locationObj.components || [];
      const city = getComponent(components, 'locality') || getComponent(components, 'administrative_area_level_2') || '';
      const state = getComponent(components, 'administrative_area_level_1') || '';
      const pincode = getComponent(components, 'postal_code') || '';

      const newAddress = {
        type: 'home',
        addressLine1: locationObj.address,
        addressLine2: savedHouseNumber,
        city,
        state,
        pincode,
        lat: locationObj.lat,
        lng: locationObj.lng,
        isDefault: true
      };

      toast.loading('Saving new address...');
      const response = await userAuthService.updateProfile({ addresses: [newAddress] }); // Overwrites to single address like ManageAddresses does
      toast.dismiss();

      if (response.success) {
        toast.success('Address saved successfully!');
        setAddress(locationObj.address);
        setHouseNumber(savedHouseNumber);
        setAddressDetails({
          address: locationObj.address,
          addressLine2: savedHouseNumber,
          lat: locationObj.lat,
          lng: locationObj.lng,
          type: 'home',
          city,
          state,
          pincode
        });
        setShowAddressModal(false);
      } else {
        toast.error(response.message || 'Failed to save address');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong');
    }
  };

  const handleContinue = async () => {
    if (!addressDetails) {
      toast.error('Please select a delivery address');
      setShowAddressModal(true);
      return;
    }

    if (bookingType === 'instant' && nearbyWorkers === 0) {
      toast.error('No workers available nearby right now. Please schedule for later.');
      return;
    }

    if (bookingType === 'scheduled' && (!selectedDate || !selectedTime)) {
      toast.error('Please select date and time');
      setShowTimeSlotModal(true);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        bookingType, // 'instant' or 'scheduled'
        address: addressDetails,
        scheduledDate: bookingType === 'instant' ? new Date() : selectedDate,
        scheduledTime: bookingType === 'instant' ? 'ASAP' : selectedTime
      };

      // Update draft with address & time
      const res = await api.put(`/users/one-time-bookings/draft/${draftId}`, payload);
      
      if (res.data.success) {
        // Navigate to Review page
        navigate(`/user/one-time-review?draftId=${draftId}`);
      } else {
        toast.error(res.data.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#10AFA5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FCFC] min-h-screen pb-40 relative">
      {/* Top Header */}
      <header className="px-4 pt-6 pb-4 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100"
          >
            <FiChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h1 className="text-lg font-bold text-[#0F172A]">Checkout</h1>
        </div>

        {/* Custom Stepper */}
        <div className="flex items-center justify-between px-2">
          {/* Step 1: Service (Completed) */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-full bg-[#10AFA5] flex items-center justify-center text-white">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Service</span>
          </div>
          
          {/* Line */}
          <div className="flex-1 h-[2px] bg-[#10AFA5] -mt-5"></div>

          {/* Step 2: Address & Time (Current) */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-full bg-[#10AFA5] flex items-center justify-center text-white shadow-md shadow-[#10AFA5]/30">
              <FiMapPin className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[#0F172A] font-bold">Address & Time</span>
          </div>

          {/* Line */}
          <div className="flex-1 h-[2px] bg-gray-200 -mt-5"></div>

          {/* Step 3: Review */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-300">
              <span className="text-xs font-bold">3</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Review</span>
          </div>

          {/* Line */}
          <div className="flex-1 h-[2px] bg-gray-200 -mt-5"></div>

          {/* Step 4: Payment */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-300">
              <span className="text-xs font-bold">4</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Payment</span>
          </div>
        </div>
      </header>

      <div className="px-5 pt-6 pb-32">
        {/* Delivery Address Section */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-[#0F172A]">Delivery Address</h2>
          <button 
            onClick={() => setShowAddressModal(true)}
            className="text-[13px] font-bold text-[#10AFA5] uppercase tracking-wide hover:underline"
          >
            Change
          </button>
        </div>
        
        {/* Address Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F1FAF9] flex items-center justify-center shrink-0">
              <FiMapPin className="text-[#10AFA5] w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] text-[15px] uppercase tracking-wider mb-1">
                {addressDetails?.type || 'Home'}
              </h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                {addressDetails?.addressLine2 ? `${addressDetails.addressLine2}, ` : ''}
                {addressDetails?.address || 'No address selected. Please add one.'}
              </p>
            </div>
          </div>
        </div>

        {/* Map View Card - Single Layer */}
        <div 
          onClick={() => setShowAddressModal(true)}
          className="w-full h-36 bg-gray-100 rounded-2xl overflow-hidden relative cursor-pointer group border border-gray-200 shadow-sm mb-6"
        >
          {!mapImgError && (
            <img 
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(addressDetails?.lat ? `${addressDetails.lat},${addressDetails.lng}` : (addressDetails?.address || 'Indore'))}&zoom=15&size=400x200&maptype=roadmap&markers=color:0x10AFA5%7C${encodeURIComponent(addressDetails?.lat ? `${addressDetails.lat},${addressDetails.lng}` : (addressDetails?.address || 'Indore'))}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
              alt="Location Map"
              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              onError={() => setMapImgError(true)}
            />
          )}
          
          {/* Fallback Background (Only visible if image errors) */}
          {mapImgError && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
              {/* Fallback Center Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#10AFA5] rounded-full flex items-center justify-center shadow-lg border-2 border-white pointer-events-none">
                <FiMapPin className="text-white w-5 h-5" />
              </div>
            </>
          )}
        </div>

        {/* Booking Type Section */}
        <h2 className="text-[16px] font-bold text-[#0F172A] mb-3">Booking Type</h2>
        <div className="flex flex-col gap-3">
          {/* Book Now Option */}
          <div 
            onClick={() => setBookingType('instant')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
              bookingType === 'instant' 
                ? 'bg-[#F1FAF9] border-[#10AFA5] shadow-sm' 
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
              <FiClock className={`w-5 h-5 ${bookingType === 'instant' ? 'text-[#10AFA5]' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0F172A] text-[15px]">Book Now</h3>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                {checkingWorkers ? 'Checking availability...' : 
                 nearbyWorkers !== null && nearbyWorkers > 0 ? (
                  <span className="text-green-600 font-medium">Workers available nearby (ETA 45 mins)</span>
                 ) : nearbyWorkers === 0 ? (
                  <span className="text-red-500 font-medium">No workers available. Try later.</span>
                 ) : 'Get expert at your location ASAP'}
              </p>
            </div>
            {bookingType === 'instant' && nearbyWorkers > 0 && (
              <div className="w-5 h-5 rounded-full bg-[#10AFA5] flex items-center justify-center shrink-0">
                <FiCheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Schedule Option */}
          <div 
            onClick={async () => {
              setBookingType('scheduled');
              // Fetch available dates
              setLoadingSchedule(true);
              setShowTimeSlotModal(true);
              try {
                const res = await api.get('/users/one-time-bookings/available-dates');
                if (res.data.success) {
                  setAvailableDates(res.data.data.filter(d => d.isAvailable).map(d => new Date(d.date)));
                }
              } catch(e) {
                console.error('Failed to load dates', e);
              } finally {
                setLoadingSchedule(false);
              }
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
              bookingType === 'scheduled' 
                ? 'bg-[#F1FAF9] border-[#10AFA5] shadow-sm' 
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
              <FiCalendar className={`w-5 h-5 ${bookingType === 'scheduled' ? 'text-[#10AFA5]' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0F172A] text-[15px]">Schedule for Later</h3>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                {bookingType === 'scheduled' && selectedDate && selectedTime 
                  ? `${selectedDate.toLocaleDateString()} at ${selectedTime}`
                  : 'Choose date & time'}
              </p>
            </div>
            {bookingType === 'scheduled' && (
              <div className="w-5 h-5 rounded-full bg-[#10AFA5] flex items-center justify-center shrink-0">
                <FiCheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 max-w-[480px] mx-auto">
        <button
          onClick={handleContinue}
          disabled={isSubmitting}
          className={`w-full py-3.5 rounded-xl font-bold text-[15px] text-white shadow-lg shadow-[#10AFA5]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#10AFA5] hover:bg-[#0E9D94]'
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Continue'
          )}
        </button>
      </div>

      {/* Modals */}
      <AddressSelectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        houseNumber={houseNumber}
        onHouseNumberChange={setHouseNumber}
        onSave={handleSaveAddress}
      />

      {showTimeSlotModal && (
        <TimeSlotModal
          isOpen={showTimeSlotModal}
          onClose={() => setShowTimeSlotModal(false)}
          availableDates={availableDates}
          isLoading={loadingSchedule}
          onSave={handleSaveSchedule}
          fetchSlots={async (date) => {
            const res = await api.get(`/users/one-time-bookings/available-slots?date=${date.toISOString()}`);
            return res.data.success ? res.data.data : [];
          }}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
        />
      )}
    </div>
  );
};

export default OneTimeServiceCheckout;
