import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiUser, FiUsers, FiTool, FiBriefcase, FiShield, 
  FiClipboard, FiCalendar, FiFileText, FiCreditCard, FiDollarSign, 
  FiPieChart, FiBell, FiStar, FiHelpCircle, FiSettings, 
  FiMenu, FiX, FiSearch, FiMessageSquare, FiChevronDown, FiLogOut
} from 'react-icons/fi';
import Logo from '../../../../components/common/Logo';
import { logout } from '../../services/authService';
import toast from 'react-hot-toast';

const navItems = [
  { name: 'Dashboard', path: '/vendor/dashboard', icon: FiHome },
  { name: 'My Profile', path: '/vendor/profile', icon: FiUser },
  { name: 'Team & Engineers', path: '/vendor/engineers', icon: FiUsers },
  { name: 'Services', path: '/vendor/services', icon: FiTool },
  { name: 'Projects', path: '/vendor/projects', icon: FiBriefcase },
  { name: 'AMC / Contracts', path: '/vendor/amc', icon: FiShield },
  { name: 'Work Orders', path: '/vendor/work-orders', icon: FiClipboard },
  { name: 'Bookings', path: '/vendor/jobs', icon: FiCalendar },
  { name: 'Invoices', path: '/vendor/invoices', icon: FiFileText },
  { name: 'Payments', path: '/vendor/payments', icon: FiCreditCard },
  { name: 'Earnings', path: '/vendor/earnings', icon: FiDollarSign },
  { name: 'Reports', path: '/vendor/reports', icon: FiPieChart },
  { name: 'Notifications', path: '/vendor/notifications', icon: FiBell, badge: 5 },
  { name: 'Reviews', path: '/vendor/reviews', icon: FiStar },
  { name: 'Support', path: '/vendor/support', icon: FiHelpCircle },
  { name: 'Settings', path: '/vendor/settings', icon: FiSettings },
];

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendorData, setVendorData] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('vendorData');
    if (data) {
      setVendorData(JSON.parse(data));
    }
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/vendor/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FCFC] overflow-hidden font-sans">
      
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

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Logo className="h-8" />
          <span className="ml-2 font-bold text-gray-800 tracking-wide">Vendor Panel</span>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/vendor/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                    isActive 
                      ? 'bg-brand text-white' 
                      : 'text-gray-600 hover:bg-brand-light hover:text-brand'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-brand' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Profile Info) */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center border border-gray-100 rounded-xl p-3 cursor-pointer hover:border-brand/30 transition-colors bg-white">
            <div className="h-10 w-10 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold shrink-0">
              {vendorData?.name?.charAt(0) || 'V'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-gray-800 truncate">{vendorData?.businessName || vendorData?.name || 'Vendor Name'}</p>
              <p className="text-xs text-gray-500 truncate">Vendor ID: VDR{vendorData?.id?.substring(0, 6).toUpperCase()}</p>
              <Link to="/vendor/profile" className="text-xs text-brand mt-1 flex items-center hover:underline">
                View Profile &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-30">
          
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-brand rounded-md"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="w-6 h-6" />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex relative max-w-md w-full ml-4 lg:ml-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-brand focus:border-brand block pl-10 p-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Action Icons */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
                <FiBell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
                <FiMessageSquare className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-sm">
                  {vendorData?.name?.charAt(0) || 'V'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{vendorData?.businessName || vendorData?.name || 'Vendor Name'}</p>
                  <p className="text-xs text-gray-500">Vendor</p>
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
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 origin-top-right"
                    >
                      <Link to="/vendor/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand">
                        <FiUser className="mr-3 w-4 h-4" /> My Profile
                      </Link>
                      <Link to="/vendor/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand">
                        <FiSettings className="mr-3 w-4 h-4" /> Settings
                      </Link>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-hide">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};

export default VendorLayout;
