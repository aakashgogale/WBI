import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PageTransition from '../components/common/PageTransition';
import VendorLayout from '../components/layout/VendorLayout';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PublicRoute from '../../../components/auth/PublicRoute';
import CashLimitModal from '../components/common/CashLimitModal'; // Import
import GlobalBookingAlert from '../components/common/GlobalBookingAlert';
// import useAppNotifications from '../../../hooks/useAppNotifications.jsx'; // Handled globally

// Lazy load wrapper with error handling (same as user app)
const lazyLoad = (importFunc) => {
  return lazy(() => {
    return Promise.resolve(importFunc()).catch((error) => {
      console.error('Failed to load vendor page:', error);
      // Return a fallback component wrapped in a Promise
      return Promise.resolve({
        default: () => (
          <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="text-center p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to load page</h2>
              <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: '#347989' }}
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

// Lazy load vendor pages for code splitting
const Login = lazyLoad(() => import('../pages/login'));
const Signup = lazyLoad(() => import('../pages/signup'));
const Dashboard = lazyLoad(() => import('../pages/Dashboard'));
const BookingAlert = lazyLoad(() => import('../pages/BookingAlert'));
const BookingAlerts = lazyLoad(() => import('../pages/BookingAlerts'));
const BookingDetails = lazyLoad(() => import('../pages/BookingDetails'));
const BookingTimeline = lazyLoad(() => import('../pages/BookingTimeline'));
const ActiveJobs = lazyLoad(() => import('../pages/ActiveJobs'));
const WorkersList = lazyLoad(() => import('../pages/WorkersList'));
const AddEditWorker = lazyLoad(() => import('../pages/AddEditWorker'));
const AssignWorker = lazyLoad(() => import('../pages/AssignWorker'));
const Earnings = lazyLoad(() => import('../pages/Earnings'));
const Wallet = lazyLoad(() => import('../pages/Wallet'));
const WithdrawalRequest = lazyLoad(() => import('../pages/WithdrawalRequest'));
const Profile = lazyLoad(() => import('../pages/Profile'));
const ProfileDetails = lazyLoad(() => import('../pages/Profile/ProfileDetails'));
const EditProfile = lazyLoad(() => import('../pages/Profile/EditProfile'));
const BookingMap = lazyLoad(() => import('../pages/BookingMap'));
const Settings = lazyLoad(() => import('../pages/Settings'));
const AddressManagement = lazyLoad(() => import('../pages/AddressManagement'));
const Notifications = lazyLoad(() => import('../pages/Notifications'));
const SettlementRequest = lazyLoad(() => import('../pages/Wallet/SettlementRequest'));
const SettlementHistory = lazyLoad(() => import('../pages/Wallet/SettlementHistory'));
const MyRatings = lazyLoad(() => import('../pages/MyRatings'));
const AboutWBI = lazyLoad(() => import('../pages/AboutWBI'));
const BillingPage = lazyLoad(() => import('../pages/BillingPage'));
const Projects = lazyLoad(() => import('../pages/Projects'));
const WorkOrders = lazyLoad(() => import('../pages/WorkOrders'));
const AmcContracts = lazyLoad(() => import('../pages/AmcContracts'));

// Loading fallback component
import LogoLoader from '../../../components/common/LogoLoader';

const LoadingFallback = () => (
  <LogoLoader />
);

const VendorRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <PageTransition>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute userType="vendor"><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute userType="vendor"><Signup /></PublicRoute>} />

            {/* Protected routes wrapped in VendorLayout */}
            <Route element={<ProtectedRoute userType="vendor"><VendorLayout /></ProtectedRoute>}>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/booking-alerts" element={<BookingAlerts />} />
              <Route path="/booking-alert/:id" element={<BookingAlert />} />
              <Route path="/booking/:id" element={<BookingDetails />} />
              <Route path="/booking/:id/map" element={<BookingMap />} />
              <Route path="/booking/:id/billing" element={<BillingPage />} />
              <Route path="/booking/:id/timeline" element={<BookingTimeline />} />
              <Route path="/jobs" element={<ActiveJobs />} />
              <Route path="/engineers" element={<WorkersList />} />
              <Route path="/workers" element={<WorkersList />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/amc" element={<AmcContracts />} />
              <Route path="/workers/add" element={<AddEditWorker />} />
              <Route path="/workers/:id/edit" element={<AddEditWorker />} />
              <Route path="/booking/:id/assign-worker" element={<AssignWorker />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/wallet/withdraw" element={<WithdrawalRequest />} />
              <Route path="/wallet/settle" element={<SettlementRequest />} />
              <Route path="/wallet/settlements" element={<SettlementHistory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/details" element={<ProfileDetails />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/address-management" element={<AddressManagement />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/my-ratings" element={<MyRatings />} />
              <Route path="/reviews" element={<MyRatings />} />
              <Route path="/support" element={<AboutWBI />} />
              <Route path="/about-wbi" element={<AboutWBI />} />
            </Route>
          </Routes>
        </PageTransition>
      </Suspense>

      {/* Global Alerts inside Vendor boundary but outside specific page routes */}
      <CashLimitModal />
      <GlobalBookingAlert />
    </ErrorBoundary>
  );
};

export default VendorRoutes;
