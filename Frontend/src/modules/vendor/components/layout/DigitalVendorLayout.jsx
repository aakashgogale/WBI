import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiUser, FiUsers, FiBriefcase, FiFolder, FiClipboard, 
  FiMapPin, FiGlobe, FiFileText, FiCreditCard, FiDollarSign, 
  FiBarChart2, FiBell, FiStar, FiHelpCircle, FiSettings, 
  FiMenu, FiSearch, FiMessageSquare, FiChevronDown, FiLogOut, FiExternalLink, FiCheckCircle, FiShield
} from 'react-icons/fi';
import Logo from '../../../../components/common/Logo';
import { logout } from '../../services/authService';
import toast from 'react-hot-toast';
import CashLimitModal from '../common/CashLimitModal';
import GlobalBookingAlert from '../common/GlobalBookingAlert';

const navItems = [
  { name: 'Dashboard', path: '/vendor/digital-solution/dashboard', icon: FiHome },
  { name: 'My Profile', path: '/vendor/digital-solution/my-profile', icon: FiUser },
  { name: 'Team & Engineers', path: '/vendor/digital-solution/engineers', icon: FiUsers },
  { name: 'Services', path: '/vendor/digital-solution/services', icon: FiBriefcase },
  { name: 'Projects', path: '/vendor/digital-solution/projects', icon: FiFolder },
  { name: 'Work Orders', path: '/vendor/digital-solution/work-orders', icon: FiClipboard },
  { name: 'Milestones', path: '/vendor/digital-solution/milestones', icon: FiMapPin },
  { name: 'Client Portal', path: '/vendor/digital-solution/client-portal', icon: FiGlobe },
  { name: 'Invoices', path: '/vendor/digital-solution/invoices', icon: FiFileText },
  { name: 'Payments', path: '/vendor/digital-solution/payments', icon: FiCreditCard },
  { name: 'Earnings', path: '/vendor/digital-solution/earnings', icon: FiDollarSign },
  { name: 'Reports', path: '/vendor/digital-solution/reports', icon: FiBarChart2 },
  { name: 'Notifications', path: '/vendor/digital-solution/notifications', icon: FiBell, badge: 12 },
  { name: 'Reviews', path: '/vendor/digital-solution/reviews', icon: FiStar },
  { name: 'Support', path: '/vendor/digital-solution/support', icon: FiHelpCircle },
  { name: 'Settings', path: '/vendor/digital-solution/settings', icon: FiSettings },
];

const DigitalVendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendorData, setVendorData] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('vendorData');
    if (data && data !== 'undefined') {
      try {
        setVendorData(JSON.parse(data));
      } catch (e) {
        console.error('Failed to parse vendorData from localStorage', e);
      }
    }
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/vendor/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Light Theme */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <Logo className="h-8" />
          <div className="ml-3">
            <span className="block font-bold text-gray-800 text-lg leading-none">Vendor Panel</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .flex-1.overflow-y-auto::-webkit-scrollbar { display: none; }
          `}} />
          <nav className="space-y-1 px-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/vendor/digital-solution/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-2.5 mb-1 rounded-xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-[#00A896] text-white shadow-md shadow-[#00A896]/20' 
                      : 'text-gray-600 hover:bg-[#F8FAFC] hover:text-[#00A896]'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className={`w-[18px] h-[18px] mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#00A896]'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-[#00A896]' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Profile Box) */}
        <div className="p-5 border-t border-gray-100">
          <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#E6F6F4] text-[#00A896] flex items-center justify-center font-bold text-lg shrink-0">
              {vendorData?.name?.charAt(0) || 'W'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{vendorData?.businessName || vendorData?.name || 'WBI'}</p>
              <p className="text-[10px] text-gray-500 truncate">Vendor ID: VDR{vendorData?.id?.substring(0, 6).toUpperCase() || '6A2A61'}</p>
              <Link to="/vendor/digital-solution/my-profile" className="text-[10px] text-[#00A896] font-bold hover:underline mt-0.5 inline-block">
                View Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-30 shadow-sm">
          
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-brand rounded-md"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="w-6 h-6" />
            </button>
            
            {/* All Clients Dropdown */}
            <div className="hidden md:flex items-center mr-6 border-r border-gray-200 pr-6">
               <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                 <FiMenu className="w-4 h-4 mr-2 text-gray-400" />
                 All Clients
                 <FiChevronDown className="ml-2 w-4 h-4 text-gray-400" />
               </button>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex relative max-w-lg w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-[#F8FAFC] border-none text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-[#00A896] block pl-11 p-2.5 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            
            {/* Action Icons */}
            <div className="flex items-center gap-3 border-r border-gray-200 pr-4 lg:pr-6">
              <button className="relative p-2.5 text-gray-500 hover:bg-[#F8FAFC] hover:text-[#00A896] rounded-xl transition-all">
                <FiBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">5</span>
              </button>
              <button className="relative p-2.5 text-gray-500 hover:bg-[#F8FAFC] hover:text-[#00A896] rounded-xl transition-all hidden sm:block">
                <FiMessageSquare className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">3</span>
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center gap-3 hover:bg-[#F8FAFC] p-2 rounded-xl transition-colors"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="h-10 w-10 rounded-full bg-[#00A896]/10 flex items-center justify-center overflow-hidden font-bold text-[#00A896]">
                  {vendorData?.name?.charAt(0) || 'W'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{vendorData?.businessName || vendorData?.name || 'WebCraft Digital Pvt. Ltd.'}</p>
                  <p className="text-xs text-gray-500 font-medium">Digital Solutions Vendor</p>
                </div>
                <FiChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 origin-top-right"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{vendorData?.businessName || vendorData?.name || 'WebCraft Digital'}</p>
                        <p className="text-xs text-gray-500 truncate">{vendorData?.email || 'info@webcraftdigital.com'}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/vendor/digital-solution/my-profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F8FAFC] hover:text-[#00A896] transition-colors">
                          <FiUser className="mr-3 w-4 h-4" /> My Profile
                        </Link>
                        <Link to="/vendor/digital-solution/settings" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F8FAFC] hover:text-[#00A896] transition-colors">
                          <FiSettings className="mr-3 w-4 h-4" /> Settings
                        </Link>
                      </div>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                      >
                        <FiLogOut className="mr-3 w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <Outlet />
        </main>
        
      </div>
      
      {/* Global Alerts for authenticated vendors */}
      <CashLimitModal />
      <GlobalBookingAlert />
    </div>
  );
};

export default DigitalVendorLayout;
