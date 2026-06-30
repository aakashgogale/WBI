import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LogoLoader from '../components/common/LogoLoader';
import PageSkeleton from '../components/common/PageSkeleton';

import UserRoutes from '../modules/user/routes';
import AdminRoutes from '../modules/admin/routes';
import LandingPage from '../modules/landing/pages/LandingPage';

// Lazy loaded routes for bundle optimization
const VendorRoutes = React.lazy(() => import('../modules/vendor/routes'));
const WorkerRoutes = React.lazy(() => import('../modules/worker/routes'));
const EngineerRoutes = React.lazy(() => import('../modules/engineer/routes'));
const B2BRoutes = React.lazy(() => import('../modules/b2b/routes'));

// Preload function for background fetching (Phase 13)
const preloadRoutes = () => {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      import('../modules/admin/routes');
      import('../modules/engineer/routes');
    });
  } else {
    setTimeout(() => {
      import('../modules/admin/routes');
      import('../modules/engineer/routes');
    }, 2000);
  }
};

const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = (e) => {
      if (e.detail && e.detail.path) {
        navigate(e.detail.path, { replace: true });
      }
    };

    window.addEventListener('auth:redirect', handleAuthRedirect);
    
    // Background prefetching for engineer/admin routes
    preloadRoutes();
    
    return () => window.removeEventListener('auth:redirect', handleAuthRedirect);
  }, [navigate]);

  return (
    <Routes location={location}>
      <Route path="/Home" element={<LandingPage />} />
      <Route path="/" element={<Navigate to="/user" replace />} />
      <Route path="/user/*" element={<UserRoutes />} />
      <Route path="/vendor/*" element={<Suspense fallback={<PageSkeleton />}><VendorRoutes /></Suspense>} />
      <Route path="/worker/*" element={<Suspense fallback={<PageSkeleton />}><WorkerRoutes /></Suspense>} />
      <Route path="/engineer/*" element={<Suspense fallback={<PageSkeleton />}><EngineerRoutes /></Suspense>} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/b2b/*" element={<Suspense fallback={<PageSkeleton />}><B2BRoutes /></Suspense>} />

      {/* Typo catchers */}
      <Route path="/engineers/*" element={<Navigate to="/engineer" replace />} />
      <Route path="/workers/*" element={<Navigate to="/worker" replace />} />
      <Route path="/vendors/*" element={<Navigate to="/vendor" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
