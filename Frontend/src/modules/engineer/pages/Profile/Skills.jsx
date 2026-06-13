import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import engineerService from '../../../../services/engineerService';
import api from '../../../../services/api';
import LogoLoader from '../../../../components/common/LogoLoader';
import DynamicForm from '../../../../components/common/DynamicForm';

export default function Skills() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dynamic Fields State
  const [dynamicConfig, setDynamicConfig] = useState(null);
  const [engineerData, setEngineerData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isEngineer = window.location.pathname.startsWith('/engineer');
        const role = isEngineer ? 'engineer' : 'worker';
        const dynamicConfigRes = await api.get(`/public/form-configs?role=${role}&formType=skills`);
        const configs = dynamicConfigRes.data?.data || [];
        const combinedConfig = {
          fields: configs
        };

        const profileRes = await engineerService.getProfile();
        if (profileRes.success && (profileRes.engineer || profileRes.worker)) {
          const loadedProfile = profileRes.engineer || profileRes.worker;
          setEngineerData(loadedProfile.customFields || {});
          setDynamicConfig(combinedConfig);
        }
      } catch (error) {
        toast.error('Failed to load skills data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDynamicFormSubmit = async (formData) => {
    try {
      setIsSaving(true);
      const payload = {
        customFields: formData
      };
      const response = await engineerService.updateProfile(payload);
      if (response.success) {
        toast.success('Skills & Expertise updated successfully');
        setEngineerData(formData);
        navigate(-1);
      } else {
        toast.error(response.message || 'Failed to update details');
      }
    } catch (error) {
      toast.error('Failed to update skills & expertise');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LogoLoader />;

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A]">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-50 active:scale-95 transition-all">
          <FiArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold">Skills & Expertise</h1>
      </div>

      <main className="px-4 pt-6 pb-24 space-y-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-2">Digital Solutions Profile</h2>
          <p className="text-sm text-gray-500 mb-6">Provide details regarding your expertise and experience to help us match you with the right projects.</p>
          
          {dynamicConfig && dynamicConfig.fields && dynamicConfig.fields.length > 0 ? (
            <DynamicForm 
              config={dynamicConfig} 
              initialData={engineerData} 
              onSubmit={handleDynamicFormSubmit} 
              submitLabel="Save Profile"
            />
          ) : (
            <div className="text-center py-6 text-gray-500 italic text-sm">
              No skills configuration found at the moment.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
