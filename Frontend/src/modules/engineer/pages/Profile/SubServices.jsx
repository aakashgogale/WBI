import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import engineerService from '../../../../services/engineerService';
import { engineerAuthService } from '../../../../services/authService';
import LogoLoader from '../../../../components/common/LogoLoader';

export default function SubServices() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableSubServices, setAvailableSubServices] = useState([]);
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [userCategories, setUserCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configRes = await engineerAuthService.getRegistrationConfig();
        if (configRes.success && configRes.config.subServices) {
          setAvailableSubServices(configRes.config.subServices);
        }

        const profileRes = await engineerService.getProfile();
        if (profileRes.success && profileRes.engineer) {
          setSelectedSubServices(profileRes.engineer.subServices || []);
          setUserCategories(profileRes.engineer.serviceCategories || []);
        }
      } catch (error) {
        toast.error('Failed to load sub-services');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleSubService = (subServiceName) => {
    if (selectedSubServices.includes(subServiceName)) {
      setSelectedSubServices(prev => prev.filter(name => name !== subServiceName));
    } else {
      setSelectedSubServices(prev => [...prev, subServiceName]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        subServices: selectedSubServices
      };
      
      const response = await engineerService.updateProfile(payload);
      if (response.success) {
        toast.success('Sub-Services updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update sub-services');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LogoLoader />;

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A]">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-50 active:scale-95 transition-all">
            <FiArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold">Specialized Sub-Services</h1>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-xl font-bold text-sm active:scale-95 transition-all shadow-sm disabled:opacity-70"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <><FiSave /> Save</>
          )}
        </button>
      </div>

      <main className="px-4 pt-6 pb-24">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-2">Your Sub-Services</h2>
          <p className="text-sm text-gray-500 mb-6">These are the specialized services you offer. You can select more based on your primary categories ({userCategories.join(', ') || 'None selected'}).</p>

          <div className="flex flex-wrap gap-3">
            {availableSubServices.map(sub => {
              const isSelected = selectedSubServices.includes(sub.name);
              return (
                <div 
                  key={sub._id}
                  onClick={() => toggleSubService(sub.name)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all flex items-center gap-2 border ${isSelected ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-md' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#4F46E5]/30 hover:bg-[#4F46E5]/5'}`}
                >
                  {sub.name}
                  {isSelected && <FiCheckCircle className="w-4 h-4" />}
                </div>
              );
            })}
            
            {availableSubServices.length === 0 && (
              <p className="text-sm text-gray-500 italic">No sub-services available.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
