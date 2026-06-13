import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import VendorLayout from '../components/layout/VendorLayout';
import DigitalVendorLayout from '../components/layout/DigitalVendorLayout';
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
const DigitalProfile = lazyLoad(() => import('../pages/Profile/DigitalProfile'));
const DigitalTeamEngineers = lazyLoad(() => import('../pages/WorkersList/DigitalTeamEngineers'));
const DigitalServices = lazyLoad(() => import('../pages/DigitalServices/DigitalServices'));

const LoadingFallback = () => (
  <div className="min-h-screen"></div>
);

const VendorRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute userType="vendor"><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute userType="vendor"><Signup /></PublicRoute>} />

            {/* Base Redirect */}
            <Route path="/" element={<Navigate to="digital-solution/dashboard" replace />} />

            {/* Digital Solution specific routes (Main Vendor Layout now) */}
            <Route element={<ProtectedRoute userType="vendor"><DigitalVendorLayout /></ProtectedRoute>}>
              <Route path="/digital-solution/dashboard" element={<Dashboard />} />
              <Route path="/digital-solution/my-profile" element={<DigitalProfile />} />
              <Route path="/digital-solution/booking-alerts" element={<BookingAlerts />} />
              <Route path="/digital-solution/booking-alert/:id" element={<BookingAlert />} />
              <Route path="/digital-solution/booking/:id" element={<BookingDetails />} />
              <Route path="/digital-solution/booking/:id/map" element={<BookingMap />} />
              <Route path="/digital-solution/booking/:id/billing" element={<BillingPage />} />
              <Route path="/digital-solution/booking/:id/timeline" element={<BookingTimeline />} />
              <Route path="/digital-solution/jobs" element={<ActiveJobs />} />
              <Route path="/digital-solution/engineers" element={<DigitalTeamEngineers />} />
              <Route path="/digital-solution/services" element={<DigitalServices />} />
              <Route path="/digital-solution/workers" element={<WorkersList />} />
              <Route path="/digital-solution/projects" element={<Projects />} />
              <Route path="/digital-solution/work-orders" element={<WorkOrders />} />
              <Route path="/digital-solution/amc" element={<AmcContracts />} />
              <Route path="/digital-solution/workers/add" element={<AddEditWorker />} />
              <Route path="/digital-solution/workers/:id/edit" element={<AddEditWorker />} />
              <Route path="/digital-solution/booking/:id/assign-worker" element={<AssignWorker />} />
              <Route path="/digital-solution/earnings" element={<Earnings />} />
              <Route path="/digital-solution/wallet" element={<Wallet />} />
              <Route path="/digital-solution/wallet/withdraw" element={<WithdrawalRequest />} />
              <Route path="/digital-solution/wallet/settle" element={<SettlementRequest />} />
              <Route path="/digital-solution/wallet/settlements" element={<SettlementHistory />} />
              <Route path="/digital-solution/profile" element={<Profile />} />
              <Route path="/digital-solution/profile/details" element={<ProfileDetails />} />
              <Route path="/digital-solution/profile/edit" element={<EditProfile />} />
              <Route path="/digital-solution/settings" element={<Settings />} />
              <Route path="/digital-solution/address-management" element={<AddressManagement />} />
              <Route path="/digital-solution/notifications" element={<Notifications />} />
              <Route path="/digital-solution/my-ratings" element={<MyRatings />} />
              <Route path="/digital-solution/reviews" element={<MyRatings />} />
              <Route path="/digital-solution/support" element={<AboutWBI />} />
              <Route path="/digital-solution/about-wbi" element={<AboutWBI />} />
              <Route path="/digital-solution/*" element={<Navigate to="/vendor/digital-solution/dashboard" replace />} />
            </Route>

            {/* Fallbacks for old routes to redirect to new structure */}
            <Route path="/dashboard" element={<Navigate to="/vendor/digital-solution/dashboard" replace />} />
            <Route path="/projects" element={<Navigate to="/vendor/digital-solution/projects" replace />} />
            <Route path="/engineers" element={<Navigate to="/vendor/digital-solution/engineers" replace />} />
            <Route path="/work-orders" element={<Navigate to="/vendor/digital-solution/work-orders" replace />} />
            <Route path="/earnings" element={<Navigate to="/vendor/digital-solution/earnings" replace />} />
            <Route path="/settings" element={<Navigate to="/vendor/digital-solution/settings" replace />} />
            <Route path="/notifications" element={<Navigate to="/vendor/digital-solution/notifications" replace />} />
            <Route path="/reviews" element={<Navigate to="/vendor/digital-solution/reviews" replace />} />
            <Route path="/support" element={<Navigate to="/vendor/digital-solution/support" replace />} />
          </Routes>
      </Suspense>

      {/* Global Alerts inside Vendor boundary but outside specific page routes */}
      <CashLimitModal />
      <GlobalBookingAlert />
    </ErrorBoundary>
  );
};

export default VendorRoutes;
