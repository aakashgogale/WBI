import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PublicRoute from '../../../components/auth/PublicRoute';
import useAppNotifications from '../../../hooks/useAppNotifications.jsx';

// Login page (not lazy loaded for faster initial access)
import Login from '../pages/login';

// Lazy load admin pages for code splitting
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Settings = lazy(() => import('../pages/Settings'));
const UserCategories = lazy(() => import('../pages/UserCategories'));
const ServiceCategories = lazy(() => import('../pages/ServiceCategories'));
const SubServices = lazy(() => import('../pages/SubServices'));
const Users = lazy(() => import('../pages/Users'));
const Vendors = lazy(() => import('../pages/Vendors'));
const Workers = lazy(() => import('../pages/Workers'));
const Bookings = lazy(() => import('../pages/Bookings'));
const BookingTracking = lazy(() => import('../pages/Bookings/Tracking'));
const BookingNotifications = lazy(() => import('../pages/Bookings/BookingNotifications'));
const Payments = lazy(() => import('../pages/Payments'));
const Reports = lazy(() => import('../pages/Reports'));
const Notifications = lazy(() => import('../pages/Notifications'));

const Plans = lazy(() => import('../pages/Plans/Plans'));
const Scrap = lazy(() => import('../pages/Scrap'));
const Settlements = lazy(() => import('../pages/Settlements'));
const Reviews = lazy(() => import('../pages/Reviews'));
const TrustVideos = lazy(() => import('../pages/TrustVideos'));
const WebEnquiries = lazy(() => import('../pages/WebEnquiries'));
const AppEnquiries = lazy(() => import('../pages/AppEnquiries'));



// Loading fallback component
import LogoLoader from '../../../components/common/LogoLoader';

const LoadingFallback = () => (
  <LogoLoader />
);

const AdminRoutes = () => {
  // Enable global notifications for admin
  // Global notifications are now handled by SocketProvider at App level
  // useAppNotifications('admin');

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Login route - outside of layout (public) */}
        <Route path="/login" element={<PublicRoute userType="admin"><Login /></PublicRoute>} />

        {/* Protected routes - inside layout */}
        <Route path="/" element={
          <ProtectedRoute userType="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users/*" element={<Users />} />
          <Route path="vendors/*" element={<Vendors />} />
          <Route path="workers/*" element={<Workers />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/tracking" element={<BookingTracking />} />
          <Route path="bookings/notifications" element={<BookingNotifications />} />
          <Route path="user-categories/*" element={<UserCategories />} />
          <Route path="service-categories/*" element={<ServiceCategories />} />
          <Route path="sub-services/*" element={<SubServices />} />
          <Route path="payments/*" element={<Payments />} />
          <Route path="reports/*" element={<Reports />} />
          <Route path="notifications/*" element={<Notifications />} />
          <Route path="scrap" element={<Scrap />} />
          <Route path="plans" element={<Plans />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="trust-videos" element={<TrustVideos />} />
          <Route path="web-enquiries" element={<WebEnquiries />} />
          <Route path="app-enquiries" element={<AppEnquiries />} />
          <Route path="crm-enquiries" element={<div className="p-6 text-gray-500 font-medium">CRM Enquiries - Coming Soon</div>} />
          <Route path="marketing-enquiries" element={<div className="p-6 text-gray-500 font-medium">Digital Marketing Enquiries - Coming Soon</div>} />
          
          <Route path="security-solutions/installation" element={<div className="p-6 text-gray-500 font-medium">Installation & Dismantle - Coming Soon</div>} />
          <Route path="security-solutions/maintenance" element={<div className="p-6 text-gray-500 font-medium">Preventive maintenance - Coming Soon</div>} />
          <Route path="security-solutions/breakdown" element={<div className="p-6 text-gray-500 font-medium">Breakdown calls - Coming Soon</div>} />
          <Route path="security-solutions/testing" element={<div className="p-6 text-gray-500 font-medium">Site Testing - Coming Soon</div>} />
          <Route path="security-solutions/panel" element={<div className="p-6 text-gray-500 font-medium">Panel installation - Coming Soon</div>} />
          <Route path="security-solutions/monitoring" element={<div className="p-6 text-gray-500 font-medium">Automated power monitoring - Coming Soon</div>} />

          <Route path="settlements/*" element={<Settlements />} />
          <Route path="settings/*" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;

