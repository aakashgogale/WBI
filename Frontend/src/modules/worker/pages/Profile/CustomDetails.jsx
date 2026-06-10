import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DynamicForm from '../../../../components/common/DynamicForm';
import api from '../../../../services/api';
import { workerAuthService } from '../../../../services/authService';
import LogoLoader from '../../../../components/common/LogoLoader';

const CustomDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [workerData, setWorkerData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Determine if engineer or worker based on path
      const isEngineer = window.location.pathname.startsWith('/engineer');
      const role = isEngineer ? 'engineer' : 'worker';
      
      const configRes = await api.get(`/public/form-configs?role=${role}&formType=profile`);
      
      // If there are multiple profile configs, we might combine them or just use the first one
      const configs = configRes.data?.data || [];
      const combinedConfig = {
        fields: configs.flatMap(c => c.fields)
      };

      const profileRes = await workerAuthService.getProfile();
      
      if (profileRes.success) {
        setWorkerData(profileRes.worker.customFields || {});
        setConfig(combinedConfig);
      }
    } catch (error) {
      toast.error('Failed to load dynamic fields');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const isEngineer = window.location.pathname.startsWith('/engineer');
      const role = isEngineer ? 'engineers' : 'workers';
      // workerAuthService calls `/api/workers`, so we can use api.put directly for engineers or workers
      await api.put(`/${role}/profile`, { customFields: formData });
      toast.success('Custom details updated successfully');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to update custom details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LogoLoader />;

  return (
    <div className="min-h-screen bg-[#F8FCFC] flex flex-col font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-700 active:scale-95 transition-all"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Custom Details</h1>
      </div>

      <div className="p-4 flex-1">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          {config && config.fields && config.fields.length > 0 ? (
            <DynamicForm 
              config={config} 
              initialData={workerData} 
              onSubmit={handleSubmit} 
              submitLabel="Save Details"
            />
          ) : (
            <div className="text-center py-10 text-gray-500">
              No custom fields configured for your profile at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomDetails;
