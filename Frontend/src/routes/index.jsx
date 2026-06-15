import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LogoLoader from '../components/common/LogoLoader';


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
        <Suspense fallback={<div className="min-h-screen bg-[#F8FCFC]" />}>
          <LandingPage />
        </Suspense>
      } />

      <Route path="/" element={<Navigate to="/user" replace />} />

      <Route path="/user/*" element={
        <Suspense fallback={<div className="min-h-screen bg-[#F8FCFC]" />}>
          <UserRoutes />
        </Suspense>
      } />

      <Route path="/vendor/*" element={
        <Suspense fallback={<div className="min-h-screen bg-[#F8FCFC]" />}>
          <VendorRoutes />
        </Suspense>
      } />

      <Route path="/worker/*" element={
        <Suspense fallback={<div className="min-h-screen bg-[#F8FCFC]" />}>
          <WorkerRoutes />
        </Suspense>
      } />
      
      <Route path="/engineer/*" element={
        <Suspense fallback={<div className="min-h-screen bg-[#F8FCFC]" />}>
          <EngineerRoutes />
        </Suspense>
      } />

      <Route path="/admin/*" element={
        <Suspense fallback={<div className="min-h-screen bg-[#F8FCFC]" />}>
          <AdminRoutes />
        </Suspense>
      } />
    </Routes>
  );
};

export default AppRoutes;
