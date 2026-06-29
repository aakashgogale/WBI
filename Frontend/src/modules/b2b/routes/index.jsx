import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../../components/common/AnimatedPage';
import B2BLayout from '../components/layout/B2BLayout';
import ErrorBoundary from '../../vendor/components/common/ErrorBoundary'; // Reuse or wrap locally
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PublicRoute from '../../../components/auth/PublicRoute';

const lazyLoad = (importFunc) => {
  return lazy(() => {
    return Promise.resolve(importFunc()).catch((error) => {
      console.error('Failed to load B2B page:', error);
      return Promise.resolve({
        default: () => (
          <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="text-center p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to load page</h2>
              <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: '#10AFA5' }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        ),
      });
    });
  });
};

// Lazy loaded B2B Pages
const LoginRegister = lazyLoad(() => import('../pages/LoginRegister'));
const Dashboard = lazyLoad(() => import('../pages/Dashboard'));
const BulkJobs = lazyLoad(() => import('../pages/BulkJobs'));
const BulkJobsHistory = lazyLoad(() => import('../pages/BulkJobs/BulkJobsHistory'));
const BulkJobDetails = lazyLoad(() => import('../pages/BulkJobs/BulkJobDetails'));
const BulkJobErrors = lazyLoad(() => import('../pages/BulkJobs/BulkJobErrors'));
const BulkJobReview = lazyLoad(() => import('../pages/BulkJobs/BulkJobReview'));
const Jobs = lazyLoad(() => import('../pages/Jobs'));
const LiveTracking = lazyLoad(() => import('../pages/LiveTracking'));
const Wallet = lazyLoad(() => import('../pages/Wallet'));
const Invoices = lazyLoad(() => import('../pages/Invoices'));
const Reports = lazyLoad(() => import('../pages/Reports'));
const Support = lazyLoad(() => import('../pages/Support'));
const Profile = lazyLoad(() => import('../pages/Profile'));
const Settings = lazyLoad(() => import('../pages/Settings'));
const Engineers = lazyLoad(() => import('../pages/Engineers'));
const Users = lazyLoad(() => import('../pages/Users'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#F0FDFA]" />
);

const B2BRoutes = () => {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location}>
            {/* Public routes */}
            <Route path="/login" element={<AnimatedPage><PublicRoute userType="b2b"><LoginRegister defaultTab="login" /></PublicRoute></AnimatedPage>} />
            <Route path="/register" element={<AnimatedPage><PublicRoute userType="b2b"><LoginRegister defaultTab="register" /></PublicRoute></AnimatedPage>} />

            {/* Base Redirect */}
            <Route path="/" element={<Navigate to="dashboard" replace />} />

            {/* Protected dashboard layout routes */}
            <Route element={<AnimatedPage><ProtectedRoute userType="b2b"><B2BLayout /></ProtectedRoute></AnimatedPage>}>
              <Route path="/dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
              <Route path="/bulk-jobs" element={<AnimatedPage><BulkJobs /></AnimatedPage>} />
              <Route path="/bulk-jobs/upload" element={<AnimatedPage><BulkJobs /></AnimatedPage>} />
              <Route path="/bulk-jobs/history" element={<AnimatedPage><BulkJobsHistory /></AnimatedPage>} />
              <Route path="/bulk-jobs/:batchId" element={<AnimatedPage><BulkJobDetails /></AnimatedPage>} />
              <Route path="/bulk-jobs/errors/:batchId" element={<AnimatedPage><BulkJobErrors /></AnimatedPage>} />
              <Route path="/bulk-jobs/review/:batchId" element={<AnimatedPage><BulkJobReview /></AnimatedPage>} />
              <Route path="/jobs" element={<AnimatedPage><Jobs /></AnimatedPage>} />
              <Route path="/live-tracking" element={<AnimatedPage><LiveTracking /></AnimatedPage>} />
              <Route path="/wallet" element={<AnimatedPage><Wallet /></AnimatedPage>} />
              <Route path="/invoices" element={<AnimatedPage><Invoices /></AnimatedPage>} />
              <Route path="/reports" element={<AnimatedPage><Reports /></AnimatedPage>} />
              <Route path="/support" element={<AnimatedPage><Support /></AnimatedPage>} />
              <Route path="/company-profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
              <Route path="/engineers" element={<AnimatedPage><Engineers /></AnimatedPage>} />
              <Route path="/users" element={<AnimatedPage><Users /></AnimatedPage>} />
              <Route path="/settings" element={<AnimatedPage><Settings /></AnimatedPage>} />
              <Route path="/*" element={<Navigate to="dashboard" replace />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
};

export default B2BRoutes;
