import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader';

// Lazy loaded module routes
const UserRoutes = React.lazy(() => import('../modules/user/routes'));
const VendorRoutes = React.lazy(() => import('../modules/vendor/routes'));
const WorkerRoutes = React.lazy(() => import('../modules/worker/routes'));
const EngineerRoutes = React.lazy(() => import('../modules/engineer/routes'));
const AdminRoutes = React.lazy(() => import('../modules/admin/routes'));
const LandingPage = React.lazy(() => import('../modules/landing/pages/LandingPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Landing Page */}
        <Route path="/Home" element={<LandingPage />} />

        {/* Redirect Root Slash to User App */}
        <Route path="/" element={<Navigate to="/user" replace />} />

        {/* User Routes */}
        <Route path="/user/*" element={<UserRoutes />} />

        {/* Vendor Routes */}
        <Route path="/vendor/*" element={<VendorRoutes />} />

        {/* Worker Routes */}
        <Route path="/worker/*" element={<WorkerRoutes />} />
        <Route path="/engineer/*" element={<EngineerRoutes />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
