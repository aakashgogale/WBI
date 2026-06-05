import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiTag, FiShoppingCart, FiUser, FiTrash2, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { HiHome, HiTag, HiShoppingCart, HiUser, HiTrash, HiCalendar } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../../../context/CartContext';

// Colorful theme for each nav item
const navItemColors = {
  home: {
    primary: '#3B82F6', // Blue
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    bg: 'rgba(59, 130, 246, 0.1)',
    shadow: 'rgba(59, 130, 246, 0.4)'
  },
  bookings: {
    primary: '#10B981', // Emerald
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    bg: 'rgba(16, 185, 129, 0.1)',
    shadow: 'rgba(16, 185, 129, 0.4)'
  },
  scrap: {
    primary: '#F59E0B', // Amber
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    bg: 'rgba(245, 158, 11, 0.1)',
    shadow: 'rgba(245, 158, 11, 0.4)'
  },
  cart: {
    primary: '#EC4899', // Pink
    gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    bg: 'rgba(236, 72, 153, 0.1)',
    shadow: 'rgba(236, 72, 153, 0.4)'
  },
  account: {
    primary: '#8B5CF6', // Violet
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    bg: 'rgba(139, 92, 246, 0.1)',
    shadow: 'rgba(139, 92, 246, 0.4)'
  }
};

const BottomNav = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const { cartCount } = useCart();

  const navItems = useMemo(() => [
    { id: 'home', label: 'Home', icon: FiHome, filledIcon: HiHome, path: '/user' },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar, filledIcon: HiCalendar, path: '/user/my-bookings' },
    { id: 'cart', label: 'Cart', icon: FiShoppingCart, filledIcon: HiShoppingCart, path: '/user/cart', badgeCount: cartCount },
    { id: 'offers', label: 'Offers', icon: FiTag, filledIcon: HiTag, path: '/user/offers' },
    { id: 'account', label: 'Account', icon: FiUser, filledIcon: HiUser, path: '/user/account' },
  ], [cartCount]);

  const getActiveTab = () => {
    if (location.pathname === '/user' || location.pathname === '/user/') return 'home';
    if (location.pathname.includes('/my-bookings')) return 'bookings';
    if (location.pathname.includes('/cart')) return 'cart';
    if (location.pathname.includes('/offers')) return 'offers';
    if (location.pathname.includes('/account')) return 'account';
    return 'home';
  };

  const activeTab = getActiveTab();
  const activeColor = '#10AFA5'; // Teal
  const inactiveColor = '#64748B';

  const handleTabClick = (path) => {
    navigate(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 w-full lg:hidden bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)] pb-2"
    >
      <div className="w-full px-2 pt-2 pb-1.5">
        <div ref={navRef} className="flex items-center justify-around max-w-md mx-auto relative">
          {navItems.map((item) => {
            const IconComponent = activeTab === item.id ? item.filledIcon : item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.path)}
                className="flex flex-col items-center justify-center w-16 h-12 relative active:scale-95 transition-transform"
              >
                <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                  <div className="relative">
                    <motion.div
                      animate={{ scale: isActive ? 1.15 : 1.0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <IconComponent
                        className="w-[24px] h-[24px] transition-colors duration-200"
                        style={{ color: isActive ? activeColor : inactiveColor }}
                      />
                    </motion.div>
                    {item.badgeCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-2 bg-[#EF4444] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-[2px] border-white shadow-sm"
                      >
                        {item.badgeCount}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[10px] transition-colors duration-200 mt-0.5"
                    style={{
                      color: isActive ? activeColor : inactiveColor,
                      fontWeight: isActive ? 700 : 500
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
