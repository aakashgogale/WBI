import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiBell, FiVolume2, FiSmartphone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    notifications: true,
    soundAlerts: true
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await workerService.getProfile();
        if (res.success && res.worker) {
          const w = res.worker;
          setFormData({
            notifications: w.settings?.notifications ?? true,
            soundAlerts: w.settings?.soundAlerts ?? true
          });
        }
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await workerService.updateProfile({
        settings: {
          ...formData,
          language: 'en'
        }
      });
      toast.success('Settings updated successfully');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ label, icon, value, onChange, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-orange-500">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800">{label}</h4>
          <p className="text-[10px] font-medium text-gray-500 mt-0.5 max-w-[200px] leading-relaxed">{description}</p>
        </div>
      </div>
      <button 
        onClick={onChange}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${value ? 'bg-orange-500' : 'bg-gray-200'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${value ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A] ">
      <Header title="Notifications" showBack={true} onBack={() => navigate(-1)} />
      
      <main className="px-5 pt-6 max-w-md mx-auto space-y-6">
        
        {/* Banner */}
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start gap-3">
          <FiBell className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-800 font-medium leading-relaxed">
            Stay updated with new job requests. We recommend keeping these turned on so you never miss an earning opportunity.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 space-y-3">
            
          <Toggle 
            label="Push Notifications"
            description="Receive alerts on your phone when a new job is assigned to you."
            icon={<FiSmartphone />}
            value={formData.notifications}
            onChange={() => setFormData({...formData, notifications: !formData.notifications})}
          />

          <Toggle 
            label="Sound Alerts"
            description="Play a ringing sound when an urgent job request arrives."
            icon={<FiVolume2 />}
            value={formData.soundAlerts}
            onChange={() => setFormData({...formData, soundAlerts: !formData.soundAlerts})}
          />

        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_20px_rgba(249,115,22,0.3)] disabled:opacity-70 disabled:active:scale-100"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <FiSave className="w-5 h-5" /> Save Preferences
            </>
          )}
        </button>

      </main>
    </div>
  );
};

export default NotificationSettings;
