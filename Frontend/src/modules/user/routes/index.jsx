import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';
import Footer from '../components/layout/Footer';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PublicRoute from '../../../components/auth/PublicRoute';
import useAppNotifications from '../../../hooks/useAppNotifications.jsx';

// Lazy load wrapper with error handling
const lazyLoad = (importFunc) => {
  return lazy(() => {
    return Promise.resolve(importFunc()).catch((error) => {
      console.error('User Module - Lazy Load Error:', error);
      // Failed to load user page
      // Return a fallback component wrapped in a Promise
      return Promise.resolve({
        default: () => (
          <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-lg w-full border border-red-100">
              <div className="text-5xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to load page</h2>
              <p className="text-gray-600 mb-6">Something went wrong while loading this section.</p>
              
              <div className="bg-red-50 p-4 rounded-xl text-left border border-red-100 mb-6 max-h-40 overflow-auto">
                <p className="text-xs font-mono text-red-600 underline mb-2">Error Details:</p>
                <code className="text-xs text-red-700 whitespace-pre-wrap">
                  {error?.message || 'Unknown loading error'}
                </code>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:opacity-90 active:scale-95 shadow-lg shadow-teal-500/20"
                  style={{ backgroundColor: '#00a6a6' }}
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-2 text-gray-400 hover:text-gray-600 font-medium transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        ),
      });
    });
  });
};

// Lazy load all user pages for code splitting with error handling
const Home = lazyLoad(() => import('../pages/Home'));
const Rewards = lazyLoad(() => import('../pages/Rewards'));
const Account = lazyLoad(() => import('../pages/Account'));
const Native = lazyLoad(() => import('../pages/Native'));
const Cart = lazyLoad(() => import('../pages/Cart'));
const Services = lazyLoad(() => import('../pages/Services'));
const CategoryDetails = lazyLoad(() => import('../pages/CategoryDetails'));
const Checkout = lazyLoad(() => import('../pages/Checkout'));
const MyBookings = lazyLoad(() => import('../pages/MyBookings'));
const BookingDetails = lazyLoad(() => import('../pages/BookingDetails'));
const Calendar = lazyLoad(() => import('../pages/Calendar'));
const Inbox = lazyLoad(() => import('../pages/Inbox'));
const BookingTrack = lazyLoad(() => import('../pages/BookingTrack'));
const BookingConfirmation = lazyLoad(() => import('../pages/BookingConfirmation'));
const Settings = lazyLoad(() => import('../pages/Settings'));
const ManagePaymentMethods = lazyLoad(() => import('../pages/ManagePaymentMethods'));
const ManageAddresses = lazyLoad(() => import('../pages/ManageAddresses'));
const Wallet = lazyLoad(() => import('../pages/Wallet'));
const MyPlan = lazyLoad(() => import('../pages/MyPlan'));
const PlanDetails = lazyLoad(() => import('../pages/MyPlan/PlanDetails'));
const MyRating = lazyLoad(() => import('../pages/MyRating'));
const AboutWBI = lazyLoad(() => import('../pages/AboutWBI'));
const UpdateProfile = lazyLoad(() => import('../pages/UpdateProfile'));
const Login = lazyLoad(() => import('../pages/login'));
const Signup = lazyLoad(() => import('../pages/signup'));
const Scrap = lazyLoad(() => import('../pages/Scrap'));
const AddScrap = lazyLoad(() => import('../pages/Scrap/AddScrap'));
const Notifications = lazyLoad(() => import('../pages/Notifications'));
const HelpSupport = lazyLoad(() => import('../pages/HelpSupport'));
const CancellationPolicy = lazyLoad(() => import('../pages/CancellationPolicy'));
const WebDevelopmentEnquiry = lazyLoad(() => import('../pages/WebDevelopmentEnquiry'));
const AppDevelopmentEnquiry = lazyLoad(() => import('../pages/AppDevelopmentEnquiry'));
const CrmEnquiry = lazyLoad(() => import('../pages/CrmEnquiry'));
const MarketingEnquiry = lazyLoad(() => import('../pages/MarketingEnquiry'));
const DesignEnquiry = lazyLoad(() => import('../pages/DesignEnquiry'));
const BankingEnquiry = lazyLoad(() => import('../pages/BankingEnquiry'));
const InstallationEnquiry = lazyLoad(() => import('../pages/InstallationEnquiry'));
const MaintenanceEnquiry = lazyLoad(() => import('../pages/MaintenanceEnquiry'));
const BreakdownEnquiry = lazyLoad(() => import('../pages/BreakdownEnquiry'));
const SiteTestingEnquiry = lazyLoad(() => import('../pages/SiteTestingEnquiry'));
const PowerMonitoringEnquiry = lazyLoad(() => import('../pages/PowerMonitoringEnquiry'));
const MultipleServicesEnquiry = lazyLoad(() => import('../pages/MultipleServicesEnquiry'));
const AtmServiceEnquiry = lazyLoad(() => import('../pages/AtmServiceEnquiry'));
const AtmCassetteService = lazyLoad(() => import('../pages/AtmCassetteService'));
const PassbookPrinterService = lazyLoad(() => import('../pages/PassbookPrinterService'));
const CdmService = lazyLoad(() => import('../pages/CdmService'));
const PosService = lazyLoad(() => import('../pages/PosService'));
const VsatService = lazyLoad(() => import('../pages/VsatService'));
const BarcodeReaderService = lazyLoad(() => import('../pages/BarcodeReaderService'));
// Energy Solutions
const DgService = lazyLoad(() => import('../pages/DgService'));
const BatteryService = lazyLoad(() => import('../pages/BatteryService'));
const UpsBatteryService = lazyLoad(() => import('../pages/UpsBatteryService'));
const EvService = lazyLoad(() => import('../pages/EvService'));
const AcPowerService = lazyLoad(() => import('../pages/AcPowerService'));
const DcPowerService = lazyLoad(() => import('../pages/DcPowerService'));
const PowerTestingService = lazyLoad(() => import('../pages/PowerTestingService'));

// Healthcare Solutions
const MedicalEquipmentEnquiry = lazyLoad(() => import('../pages/MedicalEquipmentEnquiry'));
const QualityControlTestEnquiry = lazyLoad(() => import('../pages/QualityControlTestEnquiry'));
const ElectricalSafetyTestEnquiry = lazyLoad(() => import('../pages/ElectricalSafetyTestEnquiry'));
const HcPreventiveMaintenanceEnquiry = lazyLoad(() => import('../pages/HcPreventiveMaintenanceEnquiry'));
const HcAmcEnquiry = lazyLoad(() => import('../pages/HcAmcEnquiry'));

import LogoLoader from '../../../components/common/LogoLoader';
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LogoLoader inline={true} />
  </div>
);

// Import Live Booking Card
import LiveBookingCard from '../components/booking/LiveBookingCard';

const UserRoutes = () => {
  const location = useLocation();

  // Enable global notifications for user
  // Global notifications are now handled by SocketProvider at App level
  // useAppNotifications('user');

  // Pages where BottomNav should be shown
  const bottomNavPages = ['/user', '/user/', '/user/my-bookings', '/user/scrap', '/user/services', '/user/cart', '/user/account', '/user/calendar', '/user/inbox'];
  const shouldShowBottomNav = bottomNavPages.includes(location.pathname);

  // Check if we hide the live booking card (e.g. if we are on the specific booking details or track page)
  const isBookingDetailsPage = location.pathname.match(/^\/user\/booking\/[a-zA-Z0-9]+(\/track)?$/);
  const isBookingConfirmationPage = location.pathname.includes('/booking-confirmation');


  // Check if we are on public pages (login/signup) where we shouldn't fetch bookings
  const isPublicPage = location.pathname.includes('/login') || location.pathname.includes('/signup');

  return (
    <ErrorBoundary>
      {/* Mobile App Container Wrapper for Desktop */}
      <div className="mx-auto w-full max-w-[480px] bg-[#F8FCFC] min-h-screen relative shadow-[0_0_40px_rgba(0,0,0,0.08)] overflow-x-hidden flex flex-col">
        {/* Main content area - leaves space for bottom nav when needed */}
        <div className={`flex-1 ${shouldShowBottomNav ? "pb-24" : ""}`}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<PublicRoute userType="user"><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute userType="user"><Signup /></PublicRoute>} />

              {/* Protected routes (auth required) */}
              <Route path="/" element={<ProtectedRoute userType="user"><Home /></ProtectedRoute>} />
              <Route path="/services" element={<ProtectedRoute userType="user"><Services /></ProtectedRoute>} />
              <Route path="/categories/:slug" element={<ProtectedRoute userType="user"><CategoryDetails /></ProtectedRoute>} />
              <Route path="/native" element={<ProtectedRoute userType="user"><Native /></ProtectedRoute>} />

              <Route path="/rewards" element={<ProtectedRoute userType="user"><Rewards /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute userType="user"><Account /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute userType="user"><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute userType="user"><Checkout /></ProtectedRoute>} />
              <Route path="/my-bookings" element={<ProtectedRoute userType="user"><MyBookings /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute userType="user"><Calendar /></ProtectedRoute>} />
              <Route path="/inbox" element={<ProtectedRoute userType="user"><Inbox /></ProtectedRoute>} />
              <Route path="/booking/:id" element={<ProtectedRoute userType="user"><BookingDetails /></ProtectedRoute>} />
              <Route path="/booking/:id/track" element={<ProtectedRoute userType="user"><BookingTrack /></ProtectedRoute>} />
              <Route path="/booking-confirmation/:id" element={<ProtectedRoute userType="user"><BookingConfirmation /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute userType="user"><Settings /></ProtectedRoute>} />
              <Route path="/manage-payment-methods" element={<ProtectedRoute userType="user"><ManagePaymentMethods /></ProtectedRoute>} />
              <Route path="/manage-addresses" element={<ProtectedRoute userType="user"><ManageAddresses /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute userType="user"><Wallet /></ProtectedRoute>} />
              <Route path="/my-plan" element={<ProtectedRoute userType="user"><MyPlan /></ProtectedRoute>} />
              <Route path="/my-plan/:id" element={<ProtectedRoute userType="user"><PlanDetails /></ProtectedRoute>} />
              <Route path="/my-rating" element={<ProtectedRoute userType="user"><MyRating /></ProtectedRoute>} />
              <Route path="/about-wbi" element={<ProtectedRoute userType="user"><AboutWBI /></ProtectedRoute>} />
              <Route path="/update-profile" element={<ProtectedRoute userType="user"><UpdateProfile /></ProtectedRoute>} />
              <Route path="/scrap" element={<ProtectedRoute userType="user"><Scrap /></ProtectedRoute>} />
              <Route path="/scrap/add" element={<ProtectedRoute userType="user"><AddScrap /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute userType="user"><Notifications /></ProtectedRoute>} />
              <Route path="/help-support" element={<ProtectedRoute userType="user"><HelpSupport /></ProtectedRoute>} />
              <Route path="/cancellation-policy" element={<ProtectedRoute userType="user"><CancellationPolicy /></ProtectedRoute>} />
              <Route path="/web-development-enquiry" element={<ProtectedRoute userType="user"><WebDevelopmentEnquiry /></ProtectedRoute>} />
              <Route path="/app-development-enquiry" element={<ProtectedRoute userType="user"><AppDevelopmentEnquiry /></ProtectedRoute>} />
              <Route path="/crm-enquiry" element={<ProtectedRoute userType="user"><CrmEnquiry /></ProtectedRoute>} />
              <Route path="/marketing-enquiry" element={<ProtectedRoute userType="user"><MarketingEnquiry /></ProtectedRoute>} />
              <Route path="/design-enquiry" element={<ProtectedRoute userType="user"><DesignEnquiry /></ProtectedRoute>} />
              <Route path="/banking-enquiry" element={<ProtectedRoute userType="user"><BankingEnquiry /></ProtectedRoute>} />
              <Route path="/installation-enquiry" element={<ProtectedRoute userType="user"><InstallationEnquiry /></ProtectedRoute>} />
              <Route path="/maintenance-enquiry" element={<ProtectedRoute userType="user"><MaintenanceEnquiry /></ProtectedRoute>} />
              <Route path="/breakdown-enquiry" element={<ProtectedRoute userType="user"><BreakdownEnquiry /></ProtectedRoute>} />
              <Route path="/sitetesting-enquiry" element={<ProtectedRoute userType="user"><SiteTestingEnquiry /></ProtectedRoute>} />
              <Route path="/powermonitoring-enquiry" element={<ProtectedRoute userType="user"><PowerMonitoringEnquiry /></ProtectedRoute>} />
              <Route path="/multipleservices-enquiry" element={<ProtectedRoute userType="user"><MultipleServicesEnquiry /></ProtectedRoute>} />
              <Route path="/atmservice-enquiry" element={<ProtectedRoute userType="user"><AtmServiceEnquiry /></ProtectedRoute>} />
              <Route path="/atmcassette-enquiry" element={<ProtectedRoute userType="user"><AtmCassetteService /></ProtectedRoute>} />
              <Route path="/passbookprinter-enquiry" element={<ProtectedRoute userType="user"><PassbookPrinterService /></ProtectedRoute>} />
              <Route path="/cdm-enquiry" element={<ProtectedRoute userType="user"><CdmService /></ProtectedRoute>} />
              <Route path="/pos-enquiry" element={<ProtectedRoute userType="user"><PosService /></ProtectedRoute>} />
              <Route path="/vsat-enquiry" element={<ProtectedRoute userType="user"><VsatService /></ProtectedRoute>} />
              <Route path="/barcode-reader-enquiry" element={<ProtectedRoute userType="user"><BarcodeReaderService /></ProtectedRoute>} />
              <Route path="/dg-service-enquiry" element={<ProtectedRoute userType="user"><DgService /></ProtectedRoute>} />
              <Route path="/battery-service-enquiry" element={<ProtectedRoute userType="user"><BatteryService /></ProtectedRoute>} />
              <Route path="/ups-battery-service-enquiry" element={<ProtectedRoute userType="user"><UpsBatteryService /></ProtectedRoute>} />
              <Route path="/ev-service-enquiry" element={<ProtectedRoute userType="user"><EvService /></ProtectedRoute>} />
              <Route path="/ac-power-service-enquiry" element={<ProtectedRoute userType="user"><AcPowerService /></ProtectedRoute>} />
              <Route path="/dc-power-service-enquiry" element={<ProtectedRoute userType="user"><DcPowerService /></ProtectedRoute>} />
              <Route path="/power-testing-service-enquiry" element={<ProtectedRoute userType="user"><PowerTestingService /></ProtectedRoute>} />
              <Route path="/medical-equipment-enquiry" element={<ProtectedRoute userType="user"><MedicalEquipmentEnquiry /></ProtectedRoute>} />
              <Route path="/qc-test-enquiry" element={<ProtectedRoute userType="user"><QualityControlTestEnquiry /></ProtectedRoute>} />
              <Route path="/safety-test-enquiry" element={<ProtectedRoute userType="user"><ElectricalSafetyTestEnquiry /></ProtectedRoute>} />
              <Route path="/hc-pm-enquiry" element={<ProtectedRoute userType="user"><HcPreventiveMaintenanceEnquiry /></ProtectedRoute>} />
              <Route path="/hc-amc-enquiry" element={<ProtectedRoute userType="user"><HcAmcEnquiry /></ProtectedRoute>} />
            </Routes>
        </Suspense>
        </div>

        {/* These components are OUTSIDE Suspense so they persist during page loads */}
        {!isBookingDetailsPage && !isBookingConfirmationPage && !isPublicPage && <LiveBookingCard hasBottomNav={shouldShowBottomNav} />}
        {shouldShowBottomNav && <BottomNav />}
        {/* Footer hidden temporarily as requested */}
        {/* {(location.pathname === '/user' || location.pathname === '/user/') && <Footer />} */}
      </div>
    </ErrorBoundary>
  );
};

export default UserRoutes;

