import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import BottomNav from '../components/layout/BottomNav';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PublicRoute from '../../../components/auth/PublicRoute';
import useAppNotifications from '../../../hooks/useAppNotifications.jsx';
import LogoLoader from '../../../components/common/LogoLoader';
import GlobalWorkerJobAlert from '../components/common/GlobalWorkerJobAlert';

import Login from '../pages/login';
import Signup from '../pages/signup';
import Dashboard from '../pages/Dashboard';
import AssignedJobs from '../pages/AssignedJobs';
import JobDetails from '../pages/JobDetails';
import JobProgress from '../pages/JobProgress';
import Profile from '../pages/Profile';
import EditProfile from '../pages/Profile/EditProfile';
import PersonalInfo from '../pages/Profile/PersonalInfo';
import BankDetails from '../pages/Profile/BankDetails';
import Documents from '../pages/Profile/Documents';
import WorkLocations from '../pages/Profile/WorkLocations';
import Skills from '../pages/Profile/Skills';
import SubServices from '../pages/Profile/SubServices';
import NotificationSettings from '../pages/Profile/NotificationSettings';
import Support from '../pages/Profile/Support';
import Settings from '../pages/Settings';
import Notifications from '../pages/Notifications';
import JobMap from '../pages/JobMap';
import JobTimeline from '../pages/JobTimeline';
import JobSuccess from '../pages/JobSuccess';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import ProjectMilestones from '../pages/ProjectMilestones';
import SubmitMilestone from '../pages/SubmitMilestone';
import ProjectUnderReview from '../pages/ProjectUnderReview';
import Wallet from '../pages/Wallet';
import BillingPage from '../pages/BillingPage';
import Schedule from '../pages/Schedule';
import Proposals from '../pages/Proposals';

const EngineerRoutes = () => {
  const location = useLocation();

  // Enable global notifications for worker
  // Global notifications are now handled by SocketProvider at App level
  // useAppNotifications('worker');

  const shouldHideBottomNav =
    location.pathname === '/engineer/login' ||
    location.pathname === '/engineer/signup' ||
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
            <Routes location={location || undefined}>
              {/* Public routes */}
              <Route path="/login" element={<PublicRoute userType="engineer"><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute userType="engineer"><Signup /></PublicRoute>} />

              {/* Protected routes (auth required) */}
              <Route path="/" element={<ProtectedRoute userType="engineer"><Navigate to="dashboard" replace /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute userType="engineer"><Dashboard /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute userType="engineer"><AssignedJobs /></ProtectedRoute>} />
              <Route path="/job/:id" element={<ProtectedRoute userType="engineer"><JobDetails /></ProtectedRoute>} />
              <Route path="/job/:id/progress" element={<ProtectedRoute userType="engineer"><JobProgress /></ProtectedRoute>} />
              <Route path="/job/:id/map" element={<ProtectedRoute userType="engineer"><JobMap /></ProtectedRoute>} />
              <Route path="/job/:id/timeline" element={<ProtectedRoute userType="engineer"><JobTimeline /></ProtectedRoute>} />
              <Route path="/job/:id/billing" element={<ProtectedRoute userType="engineer"><BillingPage /></ProtectedRoute>} />
              <Route path="/job/:id/success" element={<ProtectedRoute userType="engineer"><JobSuccess /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute userType="engineer"><Projects /></ProtectedRoute>} />
              <Route path="/projects/:projectId" element={<ProtectedRoute userType="engineer"><ProjectDetails /></ProtectedRoute>} />
              <Route path="/projects/:projectId/milestones" element={<ProtectedRoute userType="engineer"><ProjectMilestones /></ProtectedRoute>} />
              <Route path="/projects/:projectId/milestones/:milestoneId/submit" element={<ProtectedRoute userType="engineer"><SubmitMilestone /></ProtectedRoute>} />
              <Route path="/projects/:projectId/milestones/:milestoneId/review" element={<ProtectedRoute userType="engineer"><ProjectUnderReview /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute userType="engineer"><Profile /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute userType="engineer"><EditProfile /></ProtectedRoute>} />
              <Route path="/profile/personal-info" element={<ProtectedRoute userType="engineer"><PersonalInfo /></ProtectedRoute>} />
              <Route path="/profile/bank-details" element={<ProtectedRoute userType="engineer"><BankDetails /></ProtectedRoute>} />
              <Route path="/profile/documents" element={<ProtectedRoute userType="engineer"><Documents /></ProtectedRoute>} />
              <Route path="/profile/work-locations" element={<ProtectedRoute userType="engineer"><WorkLocations /></ProtectedRoute>} />
              <Route path="/profile/skills" element={<ProtectedRoute userType="engineer"><Skills /></ProtectedRoute>} />
              <Route path="/profile/sub-services" element={<ProtectedRoute userType="engineer"><SubServices /></ProtectedRoute>} />

              <Route path="/profile/notifications" element={<ProtectedRoute userType="engineer"><NotificationSettings /></ProtectedRoute>} />
              <Route path="/profile/support" element={<ProtectedRoute userType="engineer"><Support /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute userType="engineer"><Settings /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute userType="engineer"><Notifications /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute userType="engineer"><Wallet /></ProtectedRoute>} />
              <Route path="/schedule" element={<ProtectedRoute userType="engineer"><Schedule /></ProtectedRoute>} />
              <Route path="/proposals" element={<ProtectedRoute userType="engineer"><Proposals /></ProtectedRoute>} />
            </Routes>
            </div>

      {/* BottomNav is OUTSIDE Suspense so it persists during page loads */}
      {shouldShowBottomNav && <BottomNav />}

      <GlobalWorkerJobAlert />
    </ErrorBoundary>
  );
};

export default EngineerRoutes;


