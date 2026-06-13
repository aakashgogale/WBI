import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMail, FiCalendar, FiSave } from 'react-icons/fi';
import { BsGenderAmbiguous } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
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
        if (res.success && (res.worker || res.engineer)) {
          const w = res.worker || res.engineer;
          setFormData({
            name: w.name || '',
            phone: w.phone || '',
            email: w.email || '',
            dob: w.dob ? new Date(w.dob).toISOString().split('T')[0] : '',
            gender: w.gender || ''
          });
          setIsPhoneVerified(w.isPhoneVerified || false);
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
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    
    setSaving(true);
    try {
      await workerService.updateProfile({
        name: formData.name,
        phone: formData.phone,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header title="Personal Information" showBack={true} onBack={() => navigate(-1)} />
      
      <main className="px-5 pt-6 max-w-md mx-auto space-y-6">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
          <div className="space-y-5">
            
            {/* Name */}
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <FiUser className="text-gray-400 text-sm" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all border-none"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <FiPhone className="text-gray-400 text-sm" /> Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border-2 border-gray-300 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-800 outline-none focus:border-gray-900 transition-colors"
                  placeholder="Enter mobile number"
                />
                {isPhoneVerified && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-800 tracking-wide bg-gray-200 px-2 py-1 rounded">
                    VERIFIED
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <FiMail className="text-gray-400 text-sm" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all border-none"
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* DOB */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                  <FiCalendar className="text-gray-400 text-sm" /> Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all text-gray-700 border-none"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                  <BsGenderAmbiguous className="text-gray-400 text-sm" /> Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all text-gray-700 appearance-none border-none"
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
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-70 disabled:active:scale-100"
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
