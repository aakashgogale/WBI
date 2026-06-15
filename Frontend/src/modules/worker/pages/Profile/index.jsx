import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiEdit, FiStar, FiChevronRight, FiShield, FiCreditCard, FiFileText, FiMapPin, FiBell, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { workerAuthService } from '../../../../services/authService';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import LogoLoader from '../../../../components/common/LogoLoader';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = '#F8FCFC';

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const [profileRes, completionRes] = await Promise.all([
          workerAuthService.getProfile(),
          workerAuthService.getProfileCompletion()
        ]);
        
        if (profileRes.success) {
          setProfile(profileRes.worker);
        }
        if (completionRes.success) {
          setCompletion(completionRes.data.completionPercentage);
        }
      } catch (err) {
        toast.error('Failed to load profile from server. Loading local data.');
        const localWorkerData = JSON.parse(localStorage.getItem('workerData') || '{}');
        if (localWorkerData && Object.keys(localWorkerData).length > 0) {
          setProfile(localWorkerData);
        } else {
          setProfile(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      await workerAuthService.logout();
      toast.success('Logged out successfully');
      navigate('/engineer/login');
    } catch (error) {
      localStorage.clear();
      toast.success('Logged out successfully');
      navigate('/engineer/login');
    }
  };

  // Determine base path dynamically
  const basePath = window.location.pathname.startsWith('/engineer') ? '/engineer' : '/worker';

  const menuItems = [
    { id: 'personal', title: 'Personal Information', icon: <FiUser />, route: `${basePath}/profile/personal-info`, color: 'text-gray-800', bgColor: 'bg-gray-50' },
    { id: 'skills', title: 'Skills & Expertise', icon: <FiStar />, route: `${basePath}/profile/skills`, color: 'text-gray-800', bgColor: 'bg-gray-50' },
    { id: 'bank', title: 'Bank Details', icon: <FiCreditCard />, route: `${basePath}/profile/bank-details`, color: 'text-gray-800', bgColor: 'bg-gray-50' },
    { id: 'documents', title: 'Documents', icon: <FiFileText />, route: `${basePath}/profile/documents`, color: 'text-gray-800', bgColor: 'bg-gray-50' },
    { id: 'locations', title: 'Work Locations', icon: <FiMapPin />, route: `${basePath}/profile/work-locations`, color: 'text-gray-800', bgColor: 'bg-gray-50' },

    { id: 'notifications', title: 'Notification Settings', icon: <FiBell />, route: `${basePath}/profile/notifications`, color: 'text-gray-800', bgColor: 'bg-gray-50' },
    { id: 'support', title: 'Help & Support', icon: <FiHelpCircle />, route: `${basePath}/profile/support`, color: 'text-gray-800', bgColor: 'bg-gray-50' }
  ];

  if (isLoading) return <LogoLoader />;
  if (!profile) return null;

  return (
    <div className="min-h-screen flex flex-col  font-sans text-[#0F172A] bg-[#F8FCFC]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#F8FCFC] border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="w-10">
           {/* Menu Icon Placeholder */}
           <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </div>
        <h1 className="text-lg font-bold">Profile</h1>
        <button 
          onClick={() => navigate(`${basePath}/profile/edit`)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-700 active:scale-95 transition-all"
        >
          <FiEdit className="w-5 h-5" />
        </button>
      </div>

      <main className="flex-1 flex flex-col px-4 pt-6 pb-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 mb-6 flex items-center gap-5 relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.profilePhoto ? (
              <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <FiUser className="w-8 h-8 text-gray-900" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.name || 'Worker'}</h2>
            <div className="flex items-center gap-1.5 mb-2 text-sm text-gray-600 font-medium">
              <FiShield className="w-4 h-4 text-gray-900" />
              <span>ID: {profile.id ? profile.id.substring(profile.id.length - 6).toUpperCase() : profile._id ? profile._id.substring(profile._id.length - 6).toUpperCase() : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 text-gray-900 px-2.5 py-1 rounded-lg w-max font-bold text-sm cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => navigate('/worker/profile/ratings')}>
              <FiStar className="text-gray-900" />
              <span>{profile.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-600 ml-1 font-semibold text-xs">({profile.totalReviews || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-gray-900 text-[15px]">Profile Completion</h3>
            <span className="font-black text-gray-900 text-lg">{completion}%</span>
          </div>
          <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gray-900 rounded-full"
            />
          </div>
        </div>

        {/* Menu Sections */}
        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 mb-6 py-2">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <button
                onClick={() => navigate(item.route)}
                className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bgColor} ${item.color}`}>
                    {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                  </div>
                  <span className="font-bold text-[#0F172A] text-[15px]">{item.title}</span>
                </div>
                <FiChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              {index < menuItems.length - 1 && (
                <div className="mx-6 h-[1px] bg-gray-50/80" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-50 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                <FiLogOut />
              </div>
              <span className="font-bold text-red-500">Logout</span>
            </div>
          </button>
        </div>
      </main>

      
    </div>
  );
};

export default Profile;
