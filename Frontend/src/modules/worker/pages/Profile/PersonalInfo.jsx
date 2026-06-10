import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMail, FiCalendar, FiSave, FiAlertCircle } from 'react-icons/fi';
import { BsGenderAmbiguous } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await workerService.getProfile();
        if (res.success && res.worker) {
          const w = res.worker;
          setFormData({
            name: w.name || '',
            phone: w.phone || '',
            email: w.email || '',
            dob: w.dob ? new Date(w.dob).toISOString().split('T')[0] : '',
            gender: w.gender || ''
          });
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    setSaving(true);
    try {
      await workerService.updateProfile({
        name: formData.name,
        email: formData.email,
        dob: formData.dob || null,
        gender: formData.gender
      });
      toast.success('Personal info updated successfully');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A] ">
      <Header title="Personal Information" showBack={true} onBack={() => navigate(-1)} />
      
      <main className="px-5 pt-6 max-w-md mx-auto space-y-6">
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50">
          <div className="space-y-5">
            
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <FiUser className="text-[#10AFA5]" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5]/30 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone (Read Only) */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <FiPhone className="text-blue-500" /> Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-500 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  VERIFIED
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <FiMail className="text-orange-500" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5]/30 transition-all"
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* DOB */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                  <FiCalendar className="text-purple-500" /> Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5]/30 transition-all text-gray-700"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                  <BsGenderAmbiguous className="text-indigo-500" /> Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5]/30 transition-all text-gray-700 appearance-none"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#10AFA5] hover:bg-teal-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_20px_rgba(16,175,165,0.3)] disabled:opacity-70 disabled:active:scale-100"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <FiSave className="w-5 h-5" /> Save Changes
            </>
          )}
        </button>

      </main>
    </div>
  );
};

export default PersonalInfo;
