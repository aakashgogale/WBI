import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import BottomNav from '../components/layout/BottomNav';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PublicRoute from '../../../components/auth/PublicRoute';
import useAppNotifications from '../../../hooks/useAppNotifications.jsx';
import LogoLoader from '../../../components/common/LogoLoader';
import GlobalWorkerJobAlert from '../components/common/GlobalWorkerJobAlert';

// Lazy load wrapper with error handling
const lazyLoad = (importFunc) => {
  return lazy(() => {
    return Promise.resolve(importFunc()).catch((error) => {
      console.error('Failed to load worker page:', error);
      // Return a fallback component wrapped in a Promise
      return Promise.resolve({
        default: () => (
          <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="text-center p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to load page</h2>
              <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:opacity-90 shadow-md"
                style={{ backgroundColor: '#3B82F6' }}
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

// Lazy load worker pages for code splitting
const Login = lazyLoad(() => import('../pages/login'));
const Signup = lazyLoad(() => import('../pages/signup'));
const Dashboard = lazyLoad(() => import('../pages/Dashboard'));
const AssignedJobs = lazyLoad(() => import('../pages/AssignedJobs'));
const JobDetails = lazyLoad(() => import('../pages/JobDetails'));
const JobProgress = lazyLoad(() => import('../pages/JobProgress'));
const Profile = lazyLoad(() => import('../pages/Profile'));
const EditProfile = lazyLoad(() => import('../pages/Profile/EditProfile'));
const PersonalInfo = lazyLoad(() => import('../pages/Profile/PersonalInfo'));
const BankDetails = lazyLoad(() => import('../pages/Profile/BankDetails'));
const Documents = lazyLoad(() => import('../pages/Profile/Documents'));
const WorkLocations = lazyLoad(() => import('../pages/Profile/WorkLocations'));
const NotificationSettings = lazyLoad(() => import('../pages/Profile/NotificationSettings'));
const Support = lazyLoad(() => import('../pages/Profile/Support'));
const Settings = lazyLoad(() => import('../pages/Settings'));
const Notifications = lazyLoad(() => import('../pages/Notifications'));
const JobMap = lazyLoad(() => import('../pages/JobMap'));
const JobTimeline = lazyLoad(() => import('../pages/JobTimeline'));
const JobSuccess = lazyLoad(() => import('../pages/JobSuccess'));
const Projects = lazyLoad(() => import('../pages/Projects'));
const ProjectDetails = lazyLoad(() => import('../pages/ProjectDetails'));
const ProjectMilestones = lazyLoad(() => import('../pages/ProjectMilestones'));
const SubmitMilestone = lazyLoad(() => import('../pages/SubmitMilestone'));
const ProjectUnderReview = lazyLoad(() => import('../pages/ProjectUnderReview'));
const Wallet = lazyLoad(() => import('../pages/Wallet'));
const BillingPage = lazyLoad(() => import('../pages/BillingPage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#F8FCFC]" />
);

const WorkerRoutes = () => {
  const location = useLocation();

  // Enable global notifications for worker
  // Global notifications are now handled by SocketProvider at App level
  // useAppNotifications('worker');

  const shouldHideBottomNav =
    location.pathname === '/worker/login' ||
    location.pathname === '/worker/signup' ||
    location.pathname === '/engineer/login' ||
    location.pathname === '/engineer/signup' ||
    location.pathname.endsWith('/map') ||
    location.pathname.endsWith('/success') ||
    location.pathname.includes('/billing');

  const shouldShowBottomNav = !shouldHideBottomNav;

  return (
    <ErrorBoundary>
      {/* Main content area - leaves space for bottom nav when needed */}
      <div className={shouldShowBottomNav ? "pb-24" : ""}>
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<PublicRoute userType="worker"><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute userType="worker"><Signup /></PublicRoute>} />

              {/* Protected routes (auth required) */}
              <Route path="/" element={<ProtectedRoute userType="worker"><Navigate to="dashboard" replace /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute userType="worker"><Dashboard /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute userType="worker"><AssignedJobs /></ProtectedRoute>} />
              <Route path="/job/:id" element={<ProtectedRoute userType="worker"><JobDetails /></ProtectedRoute>} />
              <Route path="/job/:id/progress" element={<ProtectedRoute userType="worker"><JobProgress /></ProtectedRoute>} />
              <Route path="/job/:id/map" element={<ProtectedRoute userType="worker"><JobMap /></ProtectedRoute>} />
              <Route path="/job/:id/timeline" element={<ProtectedRoute userType="worker"><JobTimeline /></ProtectedRoute>} />
              <Route path="/job/:id/billing" element={<ProtectedRoute userType="worker"><BillingPage /></ProtectedRoute>} />
              <Route path="/job/:id/success" element={<ProtectedRoute userType="worker"><JobSuccess /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute userType="worker"><Projects /></ProtectedRoute>} />
              <Route path="/projects/:projectId" element={<ProtectedRoute userType="worker"><ProjectDetails /></ProtectedRoute>} />
              <Route path="/projects/:projectId/milestones" element={<ProtectedRoute userType="worker"><ProjectMilestones /></ProtectedRoute>} />
              <Route path="/projects/:projectId/milestones/:milestoneId/submit" element={<ProtectedRoute userType="worker"><SubmitMilestone /></ProtectedRoute>} />
              <Route path="/projects/:projectId/milestones/:milestoneId/review" element={<ProtectedRoute userType="worker"><ProjectUnderReview /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute userType="worker"><Profile /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute userType="worker"><EditProfile /></ProtectedRoute>} />
              <Route path="/profile/personal-info" element={<ProtectedRoute userType="worker"><PersonalInfo /></ProtectedRoute>} />
              <Route path="/profile/bank-details" element={<ProtectedRoute userType="worker"><BankDetails /></ProtectedRoute>} />
              <Route path="/profile/documents" element={<ProtectedRoute userType="worker"><Documents /></ProtectedRoute>} />
              <Route path="/profile/work-locations" element={<ProtectedRoute userType="worker"><WorkLocations /></ProtectedRoute>} />

              <Route path="/profile/notifications" element={<ProtectedRoute userType="worker"><NotificationSettings /></ProtectedRoute>} />
              <Route path="/profile/support" element={<ProtectedRoute userType="worker"><Support /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute userType="worker"><Settings /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute userType="worker"><Notifications /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute userType="worker"><Wallet /></ProtectedRoute>} />
            </Routes>
        </Suspense>
      </div>

      {/* BottomNav is OUTSIDE Suspense so it persists during page loads */}
      {shouldShowBottomNav && <BottomNav />}

      <GlobalWorkerJobAlert />
    </ErrorBoundary>
  );
};

export default WorkerRoutes;

