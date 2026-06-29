import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import BottomNav from '../components/layout/BottomNav';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PublicRoute from '../../../components/auth/PublicRoute';
import useAppNotifications from '../../../hooks/useAppNotifications.jsx';
import LogoLoader from '../../../components/common/LogoLoader';
import GlobalWorkerJobAlert from '../components/common/GlobalWorkerJobAlert';
import { AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../../components/common/AnimatedPage';

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
            <AnimatePresence mode="wait">
            <Routes location={location || undefined}>
              {/* Public routes */}
              <Route path="/login" element={<AnimatedPage><PublicRoute userType="engineer"><Login /></PublicRoute></AnimatedPage>} />
              <Route path="/signup" element={<AnimatedPage><PublicRoute userType="engineer"><Signup /></PublicRoute></AnimatedPage>} />

              {/* Protected routes (auth required) */}
              <Route path="/" element={<AnimatedPage><ProtectedRoute userType="engineer"><Navigate to="dashboard" replace /></ProtectedRoute></AnimatedPage>} />
              <Route path="/dashboard" element={<AnimatedPage><ProtectedRoute userType="engineer"><Dashboard /></ProtectedRoute></AnimatedPage>} />
              <Route path="/jobs" element={<AnimatedPage><ProtectedRoute userType="engineer"><AssignedJobs /></ProtectedRoute></AnimatedPage>} />
              <Route path="/job/:id" element={<AnimatedPage><ProtectedRoute userType="engineer"><JobDetails /></ProtectedRoute></AnimatedPage>} />
              <Route path="/job/:id/progress" element={<AnimatedPage><ProtectedRoute userType="engineer"><JobProgress /></ProtectedRoute></AnimatedPage>} />
              <Route path="/job/:id/map" element={<AnimatedPage><ProtectedRoute userType="engineer"><JobMap /></ProtectedRoute></AnimatedPage>} />
              <Route path="/job/:id/timeline" element={<AnimatedPage><ProtectedRoute userType="engineer"><JobTimeline /></ProtectedRoute></AnimatedPage>} />
              <Route path="/job/:id/billing" element={<AnimatedPage><ProtectedRoute userType="engineer"><BillingPage /></ProtectedRoute></AnimatedPage>} />
              <Route path="/job/:id/success" element={<AnimatedPage><ProtectedRoute userType="engineer"><JobSuccess /></ProtectedRoute></AnimatedPage>} />
              <Route path="/projects" element={<AnimatedPage><ProtectedRoute userType="engineer"><Projects /></ProtectedRoute></AnimatedPage>} />
              <Route path="/projects/:projectId" element={<AnimatedPage><ProtectedRoute userType="engineer"><ProjectDetails /></ProtectedRoute></AnimatedPage>} />
              <Route path="/projects/:projectId/milestones" element={<AnimatedPage><ProtectedRoute userType="engineer"><ProjectMilestones /></ProtectedRoute></AnimatedPage>} />
              <Route path="/projects/:projectId/milestones/:milestoneId/submit" element={<AnimatedPage><ProtectedRoute userType="engineer"><SubmitMilestone /></ProtectedRoute></AnimatedPage>} />
              <Route path="/projects/:projectId/milestones/:milestoneId/review" element={<AnimatedPage><ProtectedRoute userType="engineer"><ProjectUnderReview /></ProtectedRoute></AnimatedPage>} />
              <Route path="/profile" element={<AnimatedPage><ProtectedRoute userType="engineer"><Profile /></ProtectedRoute></AnimatedPage>} />
              <Route path="/profile/edit" element={<AnimatedPage><ProtectedRoute userType="engineer"><EditProfile /></ProtectedRoute></AnimatedPage>} />
              <Route path="/profile/personal-info" element={<AnimatedPage><ProtectedRoute userType="engineer"><PersonalInfo /></ProtectedRoute></AnimatedPage>} />
              <Route path="/profile/bank-details" element={<AnimatedPage><ProtectedRoute userType="engineer"><BankDetails /></ProtectedRoute></AnimatedPage>} />
              <Route path="/profile/documents" element={<AnimatedPage><ProtectedRoute userType="engineer"><Documents /></ProtectedRoute></AnimatedPage>} />
              <Route path="/profile/work-locations" element={<AnimatedPage><ProtectedRoute userType="engineer"><WorkLocations /></ProtectedRoute></AnimatedPage>} />
              <Route path="/profile/skills" element={<AnimatedPage><ProtectedRoute userType="engineer"><Skills /></ProtectedRoute></AnimatedPage>} />
              <Route path="/profile/sub-services" element={<AnimatedPage><ProtectedRoute userType="engineer"><SubServices /></ProtectedRoute></AnimatedPage>} />

              <Route path="/profile/notifications" element={<AnimatedPage><ProtectedRoute userType="engineer"><NotificationSettings /></ProtectedRoute></AnimatedPage>} />
              <Route path="/profile/support" element={<AnimatedPage><ProtectedRoute userType="engineer"><Support /></ProtectedRoute></AnimatedPage>} />
              <Route path="/settings" element={<AnimatedPage><ProtectedRoute userType="engineer"><Settings /></ProtectedRoute></AnimatedPage>} />
              <Route path="/notifications" element={<AnimatedPage><ProtectedRoute userType="engineer"><Notifications /></ProtectedRoute></AnimatedPage>} />
              <Route path="/wallet" element={<AnimatedPage><ProtectedRoute userType="engineer"><Wallet /></ProtectedRoute></AnimatedPage>} />
              <Route path="/schedule" element={<AnimatedPage><ProtectedRoute userType="engineer"><Schedule /></ProtectedRoute></AnimatedPage>} />
              <Route path="/proposals" element={<AnimatedPage><ProtectedRoute userType="engineer"><Proposals /></ProtectedRoute></AnimatedPage>} />
            </Routes>
            </AnimatePresence>

      </div>

      {/* BottomNav is OUTSIDE Suspense so it persists during page loads */}
      {shouldShowBottomNav && <BottomNav />}

      <GlobalWorkerJobAlert />
    </ErrorBoundary>
  );
};

export default EngineerRoutes;

