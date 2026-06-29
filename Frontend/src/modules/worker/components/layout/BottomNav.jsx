import React, { useRef, useEffect, useState, memo, useMemo } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FiHome, FiBriefcase, FiUser, FiDollarSign, FiFolder } from 'react-icons/fi';
import { HiHome, HiBriefcase, HiUser, HiFolder } from 'react-icons/hi';
import { FiBell } from 'react-icons/fi';
import { gsap } from 'gsap';
import { workerTheme as themeColors } from '../../../../theme';
import api from '../../../../services/api';

const BottomNav = memo(() => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = React.useState(false);
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious();
    if (latest > prev && latest > 150) setHidden(true);
    else setHidden(false);
  });

  const navigate = useNavigate();
  const location = useLocation();
  const iconRefs = useRef({});
  const activeAnimations = useRef({});
  const [pendingJobsCount, setPendingJobsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const queryClient = useQueryClient();

  // Load counts
  useEffect(() => {
    const updatePendingCount = () => {
      try {
        // Count pending assigned jobs (waiting for accept/reject)
        const assignedJobs = JSON.parse(localStorage.getItem('workerAssignedJobs') || '[]');
        const pendingJobs = assignedJobs.filter(job =>
          job.workerStatus === 'PENDING'
        );
        setPendingJobsCount(pendingJobs.length);
      } catch (error) {
        console.error('Error reading pending jobs:', error);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/worker');
        if (res.data.success && typeof res.data.unreadCount === 'number') {
          setUnreadNotificationsCount(res.data.unreadCount);
        }
      } catch (error) {
        // Silent fail
      }
    };

    updatePendingCount();
    fetchUnreadCount();

    window.addEventListener('storage', updatePendingCount);
    window.addEventListener('workerJobsUpdated', updatePendingCount);

    const interval = setInterval(fetchUnreadCount, 60000);

    // Background Prefetching for Sub-1-second loading
    const prefetchTabs = async () => {
      try {
        const workerService = (await import('../../../../services/workerService')).default;
        
        // Prefetch Dashboard
        queryClient.prefetchQuery({
          queryKey: ['workerDashboardStats'],
          queryFn: () => workerService.getDashboardStats(),
          staleTime: 60 * 1000
        });
        
        // Prefetch Profile
        queryClient.prefetchQuery({
          queryKey: ['workerProfile'],
          queryFn: () => workerService.getProfile(),
          staleTime: 60 * 1000
        });

        // Prefetch Jobs
        queryClient.prefetchQuery({
          queryKey: ['workerAssignedJobs', 1, 'all'],
          queryFn: () => workerService.getAssignedJobs({ page: 1, limit: 10, status: 'all' }),
          staleTime: 60 * 1000
        });
        
        // Prefetch Wallet (if controller has getWallet)
      } catch (err) {
        // Silently ignore prefetch errors
      }
    };

    // Delay prefetching slightly so it doesn't block initial render
    const prefetchTimer = setTimeout(prefetchTabs, 500);

    return () => {
      window.removeEventListener('storage', updatePendingCount);
      window.removeEventListener('workerJobsUpdated', updatePendingCount);
      clearInterval(interval);
      clearTimeout(prefetchTimer);
    };
  }, [queryClient]);

  const navItems = useMemo(() => {
    return [
      { path: '/worker/dashboard', icon: FiHome, activeIcon: HiHome, label: 'Home' },
      { path: '/worker/jobs', icon: FiBriefcase, activeIcon: HiBriefcase, label: 'Jobs', badge: pendingJobsCount },
      { path: '/worker/projects', icon: FiFolder, activeIcon: HiFolder, label: 'Projects' },
      { path: '/worker/wallet', icon: FiDollarSign, activeIcon: FiDollarSign, label: 'Wallet' },
      { path: '/worker/profile', icon: FiUser, activeIcon: HiUser, label: 'Profile' },
    ];
  }, [pendingJobsCount]);

  const handleNavClick = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };



  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.02)]"
      variants={{ visible: { y: 0 }, hidden: { y: '100%' } }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      style={{
        zIndex: 40,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/worker/dashboard' && location.pathname === '/worker');
          const IconComponent = isActive ? item.activeIcon : item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className="flex flex-col items-center justify-center relative w-16 h-14 rounded-xl transition-all duration-300 group"
              style={{
                // No inline background here
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 });
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  gsap.to(e.currentTarget, { scale: 1.0, duration: 0.2 });
                }
              }}
            >
              {/* Active Indicator Bar - Gradient Accent */}
              {isActive && (
                <div
                  className="absolute -top-2 w-10 h-1 rounded-b-full"
                  style={{
                    background: themeColors.gradient,
                    boxShadow: `0 2px 8px ${themeColors.brand.teal}4D`,
                  }}
                />
              )}

              {/* Active Background - Very Subtle Teal Tint */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-xl scale-90"
                  style={{ backgroundColor: `${themeColors.brand.teal}0A` }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative mb-0.5">
                  <IconComponent
                    ref={(el) => {
                      iconRefs.current[item.path] = el;
                    }}
                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}
                    style={{
                      color: isActive ? themeColors.button : '#9CA3AF',
                      filter: isActive ? `drop-shadow(0 2px 4px ${themeColors.brand.teal}1A)` : 'none'
                    }}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className="absolute bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                      style={{
                        top: '-6px',
                        right: '-8px',
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 4px',
                        fontSize: '10px',
                        lineHeight: '18px',
                        border: '2px solid white',
                        boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
                        zIndex: 50,
                      }}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] transition-colors duration-300 ${isActive ? 'font-bold' : 'font-medium text-gray-500'}`}
                  style={{
                    color: isActive ? themeColors.button : '#6B7280',
                  }}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
});

BottomNav.displayName = 'BottomNav';
export default BottomNav;

