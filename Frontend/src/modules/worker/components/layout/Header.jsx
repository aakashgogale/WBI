import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBell, FiSearch, FiX } from 'react-icons/fi';
import { gsap } from 'gsap';
import { workerTheme as themeColors } from '../../../../theme';
import { animateLogo } from '../../../../utils/gsapAnimations';
import Logo from '../../../../components/common/Logo';
import api from '../../../../services/api';

const Header = ({
  title,
  onBack,
  showBack = true,
  showSearch = false,
  showNotifications = true,
  notificationCount = 0
}) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = React.useState(false);
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious();
    if (latest > prev && latest > 100) setHidden(true);
    else setHidden(false);
  });

  const navigate = useNavigate();
  const logoRef = useRef(null);
  const bellRef = useRef(null);
  const bellButtonRef = useRef(null);
  const [count, setCount] = useState(notificationCount);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync prop changes
  useEffect(() => {
    if (typeof notificationCount !== 'undefined') {
      setCount(notificationCount);
    }
  }, [notificationCount]);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/worker');
        if (res.data.success && typeof res.data.unreadCount === 'number') {
          setCount(res.data.unreadCount);
        }
      } catch (error) {
        // Silent fail
      }
    };

    if (showNotifications) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [showNotifications]);

  useEffect(() => {
    if (logoRef.current && !showBack) {
      animateLogo(logoRef.current);
      gsap.fromTo(logoRef.current,
        {
          opacity: 0,
          scale: 0.8,
          y: -10
        },
        {
          opacity: 1,
          scale: 1.0,
          y: 0,
          duration: 0.6,
          ease: 'back.out(1.7)'
        }
      );
    }
  }, [showBack]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleNotifications = () => {
    navigate('/worker/notifications');
  };

  const handleLogoClick = () => {
    navigate('/worker/dashboard');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/worker/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  return (
    <motion.header className="sticky top-0 z-40 w-full bg-slate-50/80 backdrop-blur-md pb-2 pt-1"
      variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}>
      <div className="px-4 py-3 flex items-center justify-between min-h-[60px]">
        {isSearching ? (
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 flex items-center gap-3 animate-in fade-in duration-200"
          >
            <div className="flex-1 relative flex items-center">
              <FiSearch className="absolute left-4 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, projects..."
                className="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsSearching(false)}
              className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <>
            {/* Left: Back button or Logo */}
            <div className="flex items-center gap-3">
              {showBack ? (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-gray-50 transition-colors active:scale-95"
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={handleLogoClick}
                  onMouseEnter={() => {
                    if (logoRef.current) gsap.to(logoRef.current, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
                  }}
                  onMouseLeave={() => {
                    if (logoRef.current) gsap.to(logoRef.current, { scale: 1.0, duration: 0.3, ease: 'power2.out' });
                  }}
                >
                  <img fetchPriority="low" loading="lazy" 
                    ref={logoRef}
                    src="/logo/WBILogo.jpg" 
                    alt="WBI Logo" 
                    className="h-9 object-contain mix-blend-multiply" 
                  />
                </div>
              )}
              {showBack && <h1 className="text-lg font-bold text-gray-800 tracking-tight">{title || 'Worker'}</h1>}
            </div>

            {/* Right: Search and Notifications */}
            <div className="flex items-center gap-3">
              {showSearch && (
                <button
                  className="p-2 rounded-full hover:bg-gray-50 transition-colors active:scale-95 text-gray-600"
                  onClick={() => setIsSearching(true)}
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              )}
              {showNotifications && (
                <button
                  ref={bellButtonRef}
                  onClick={handleNotifications}
                  className="relative p-2 rounded-full hover:bg-gray-50 transition-colors active:scale-95 text-gray-600"
                  onMouseEnter={() => {
                    if (bellRef.current) {
                      gsap.to(bellRef.current, { rotation: 15, scale: 1.1, duration: 0.3, ease: 'power2.out' });
                    }
                  }}
                  onMouseLeave={() => {
                    if (bellRef.current) {
                      gsap.to(bellRef.current, { rotation: 0, scale: 1.0, duration: 0.3, ease: 'power2.out' });
                    }
                  }}
                >
                  <FiBell ref={bellRef} className="w-5 h-5" />
                  {count > 0 && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
