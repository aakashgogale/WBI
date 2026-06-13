import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiMapPin, FiNavigation } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';
import AddressSelectionModal from '../../../user/pages/Checkout/components/AddressSelectionModal';

const WorkLocations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    fullAddress: '',
    serviceRadius: 10
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await workerService.getProfile();
        if (res.success && res.worker) {
          const w = res.worker;
          setFormData({
            addressLine1: w.address?.addressLine1 || '',
            city: w.address?.city || '',
            state: w.address?.state || '',
            pincode: w.address?.pincode || '',
            fullAddress: w.address?.fullAddress || '',
            serviceRadius: w.workLocations?.serviceRadius || 10
          });
        }
      } catch (err) {
        toast.error('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAddressSave = (houseNumber, location) => {
    let city = '';
    let state = '';
    let pincode = '';

    if (location.components) {
      location.components.forEach(comp => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
        if (comp.types.includes('postal_code')) pincode = comp.long_name;
      });
    }

    setFormData(prev => ({
      ...prev,
      addressLine1: houseNumber || prev.addressLine1,
      city: city || prev.city,
      state: state || prev.state,
      pincode: pincode || prev.pincode,
      fullAddress: location.address
    }));
    setIsAddressModalOpen(false);
  };

  const handleSave = async () => {
    if (!formData.city && !formData.fullAddress) {
      toast.error('Please select your primary work area');
      return;
    }
    
    setSaving(true);
    try {
      await workerService.updateProfile({
        address: {
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          fullAddress: formData.fullAddress
        },
        workLocations: {
          serviceRadius: formData.serviceRadius
        }
      });
      toast.success('Work location updated successfully');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update locations');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A] ">
      <Header title="Work Locations" showBack={true} onBack={() => navigate(-1)} />
      
      <main className="px-5 pt-6 max-w-md mx-auto space-y-6">
        
        {/* Banner */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex items-start gap-3">
          <FiNavigation className="w-5 h-5 text-gray-700 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700 font-medium leading-relaxed">
            Set your primary working location. You will receive one-time job requests based on this location and your chosen service radius.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 space-y-5">
            
          {/* Primary Location */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
              <FiMapPin className="text-slate-400 text-sm" /> Primary Work Area
            </label>
            
            <div className="p-4 bg-[#F8F9FA] rounded-2xl mb-3">
              <p className="text-sm font-medium text-gray-700 leading-relaxed">
                {formData.fullAddress || 
                  (formData.addressLine1 ? `${formData.addressLine1}, ${formData.city}` : 'No location set')}
              </p>
              {!formData.fullAddress && !formData.addressLine1 && (
                <p className="text-xs text-gray-400 italic mt-1">Tap below to set location from map</p>
              )}
            </div>

            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm border border-gray-200 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <FiMapPin className="w-4 h-4" />
              {formData.fullAddress ? 'Change Location on Map' : 'Set Location on Map'}
            </button>
          </div>

          <div className="h-px bg-gray-100 my-2"></div>

          {/* Service Radius */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 flex items-center justify-between">
              <span>Service Radius</span>
              <span className="text-gray-900 font-black text-sm">{formData.serviceRadius} km</span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={formData.serviceRadius}
              onChange={(e) => setFormData({...formData, serviceRadius: Number(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
            />
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 px-1">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.15)] disabled:opacity-70 disabled:active:scale-100"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <FiSave className="w-5 h-5" /> Save Location Settings
            </>
          )}
        </button>

      </main>

      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={formData.fullAddress}
        houseNumber={formData.addressLine1}
        onHouseNumberChange={(val) => setFormData({...formData, addressLine1: val})}
        onSave={handleAddressSave}
      />
    </div>
  );
};

export default WorkLocations;
