import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import { userAuthService } from '../../../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiUser,
  FiEdit3,
  FiClipboard,
  FiHeadphones,
  FiFileText,
  FiStar,
  FiMapPin,
  FiCreditCard,
  FiSettings,
  FiChevronRight,
  FiBell,
  FiShoppingBag,
  FiLogOut,
  FiGift,
  FiShield,
  FiZap,
  FiCheckCircle
} from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';
import NotificationBell from '../../components/common/NotificationBell';

const Account = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    name: 'Verified Customer',
    phone: '',
    email: '',
    isPhoneVerified: false,
    isEmailVerified: false,
    walletBalance: 0,
    plans: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First check localStorage
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserProfile({
            name: userData.name || 'Verified Customer',
            phone: userData.phone || '',
            email: userData.email || '',
            isPhoneVerified: userData.isPhoneVerified || false,
            isEmailVerified: userData.isEmailVerified || false,
            profilePhoto: userData.profilePhoto || '',
            walletBalance: userData.wallet?.balance ?? 0
          });
        }

        // Fetch fresh data from API
        const response = await userAuthService.getProfile();
        if (response.success && response.user) {
          setUserProfile({
            name: response.user.name || 'Verified Customer',
            phone: response.user.phone || '',
            email: response.user.email || '',
            isPhoneVerified: response.user.isPhoneVerified || false,
            isEmailVerified: response.user.isEmailVerified || false,
            profilePhoto: response.user.profilePhoto || '',
            walletBalance: response.user.wallet?.balance ?? 0,
            plans: response.user.plans
          });
        }
      } catch (error) {
        // Use localStorage data if API fails
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserProfile({
            name: userData.name || 'Verified Customer',
            phone: userData.phone || '',
            email: userData.email || '',
            isPhoneVerified: userData.isPhoneVerified || false,
            isEmailVerified: userData.isEmailVerified || false
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('+91')) return phone;
    if (phone.length === 10) return `+91 ${phone}`;
    return phone;
  };

  // Get initials for avatar
  const getInitials = () => {
    if (userProfile.name && userProfile.name !== 'Verified Customer') {
      const names = userProfile.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (userProfile.phone) {
      return userProfile.phone.slice(-2);
    }
    return 'VC';
  };

  const handleLogout = async () => {
    try {
      await userAuthService.logout();
      toast.success('Logged out successfully');
      navigate('/user/login');
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      toast.success('Logged out successfully');
      navigate('/user/login');
    }
  };

  const MenuItem = ({ icon: Icon, label, onClick, color = "text-gray-900", badge }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group mb-3"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${color === 'text-red-500' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-brand group-hover:bg-brand-light'}`}>
          <Icon className={`w-5 h-5 ${color === 'text-red-500' ? '' : 'text-brand'}`} />
        </div>
        <span className={`font-semibold ${color}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
            {badge}
          </span>
        )}
        <FiChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand transition-colors" />
      </div>
    </motion.button>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom)] mb-20 bg-[#F7F7FB] relative">
      <div className="relative z-10">
        <header className="pt-6 pb-4 px-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-gray-900 font-poppins tracking-tight">Profile</h1>
          <NotificationBell />
        </header>

        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-4 pt-2 max-w-lg mx-auto"
        >
          {/* Avatar & Info */}
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center mb-8">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full p-1 bg-white shadow-purple-soft">
                {userProfile.profilePhoto ? (
                  <img
                    src={userProfile.profilePhoto}
                    alt={userProfile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center text-white font-black text-3xl bg-brand">
                    {getInitials()}
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/user/update-profile')}
                className="absolute bottom-0 right-0 p-2 bg-brand text-white rounded-full border-2 border-white shadow-md active:scale-95 transition-transform"
              >
                <FiEdit3 className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{userProfile.name}</h2>
            <p className="text-sm text-gray-500">{userProfile.email || userProfile.phone || 'No email linked'}</p>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
              <span className="text-2xl font-bold text-gray-900 block mb-1">12</span>
              <span className="text-[11px] text-gray-500 font-bold uppercase">Bookings</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
              <span className="text-2xl font-bold text-gray-900 block mb-1">4</span>
              <span className="text-[11px] text-gray-500 font-bold uppercase">Reviews</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
              <span className="text-2xl font-bold text-gray-900 block mb-1">8</span>
              <span className="text-[11px] text-gray-500 font-bold uppercase">Saved</span>
            </div>
          </motion.div>

          {/* Menu Items */}
          <motion.div variants={itemVariants} className="mb-8">
            <MenuItem icon={FiMapPin} label="My Addresses" onClick={() => navigate('/user/manage-addresses')} />
            <MenuItem icon={FiCreditCard} label="Payment Methods" onClick={() => navigate('/user/manage-payment-methods')} />
            <MenuItem icon={FiBell} label="Notifications" onClick={() => navigate('/user/notifications')} />
            <MenuItem icon={FiHeadphones} label="Help & Support" onClick={() => navigate('/user/help-support')} />
            <MenuItem icon={FiLogOut} label="Logout" onClick={handleLogout} color="text-red-500" />
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
};

export default Account;
