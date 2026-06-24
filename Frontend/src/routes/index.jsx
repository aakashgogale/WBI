import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LogoLoader from '../components/common/LogoLoader';
import PageSkeleton from '../components/common/PageSkeleton';

// Lazy loaded module routes
const UserRoutes = React.lazy(() => import('../modules/user/routes'));
const VendorRoutes = React.lazy(() => import('../modules/vendor/routes'));
const WorkerRoutes = React.lazy(() => import('../modules/worker/routes'));
const EngineerRoutes = React.lazy(() => import('../modules/engineer/routes'));
const AdminRoutes = React.lazy(() => import('../modules/admin/routes'));
const LandingPage = React.lazy(() => import('../modules/landing/pages/LandingPage'));

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
    return () => window.removeEventListener('auth:redirect', handleAuthRedirect);
  }, [navigate]);

  return (
    <Routes location={location}>
      <Route path="/Home" element={
        <Suspense fallback={<PageSkeleton />}>
          <LandingPage />
        </Suspense>
      } />

      <Route path="/" element={<Navigate to="/user" replace />} />

      <Route path="/user/*" element={
        <Suspense fallback={<PageSkeleton />}>
          <UserRoutes />
        </Suspense>
      } />

      <Route path="/vendor/*" element={
        <Suspense fallback={<PageSkeleton />}>
          <VendorRoutes />
        </Suspense>
      } />

      <Route path="/worker/*" element={
        <Suspense fallback={<PageSkeleton />}>
          <WorkerRoutes />
        </Suspense>
      } />
      
      <Route path="/engineer/*" element={
        <Suspense fallback={<PageSkeleton />}>
          <EngineerRoutes />
        </Suspense>
      } />

      <Route path="/admin/*" element={
        <Suspense fallback={<PageSkeleton />}>
          <AdminRoutes />
        </Suspense>
      } />
    </Routes>
  );
};

export default AppRoutes;
