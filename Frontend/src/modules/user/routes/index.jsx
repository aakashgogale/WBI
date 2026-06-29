import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../../components/common/AnimatedPage';
import BottomNav from '../components/layout/BottomNav';
import Footer from '../components/layout/Footer';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PublicRoute from '../../../components/auth/PublicRoute';
import useAppNotifications from '../../../hooks/useAppNotifications.jsx';
import LogoLoader from '../../../components/common/LogoLoader';
import PageSkeleton from '../../../components/common/PageSkeleton';
import LiveBookingCard from '../components/booking/LiveBookingCard';

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
const OneTimeServiceCheckout = lazyLoad(() => import('../pages/OneTimeServiceCheckout'));
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
const WorkerSelection = lazyLoad(() => import('../pages/WorkerSelection'));
const OneTimeServiceDetail = lazyLoad(() => import('../pages/OneTimeServiceDetail'));
const OneTimeServicePackages = lazyLoad(() => import('../pages/OneTimeServicePackages'));
const ReviewBooking = lazyLoad(() => import('../pages/ReviewBooking'));
const SearchingTechnician = lazyLoad(() => import('../pages/SearchingTechnician'));
const TechnicianFound = lazyLoad(() => import('../pages/TechnicianFound'));

// Healthcare Solutions
const MedicalEquipmentEnquiry = lazyLoad(() => import('../pages/MedicalEquipmentEnquiry'));
const QualityControlTestEnquiry = lazyLoad(() => import('../pages/QualityControlTestEnquiry'));
const ElectricalSafetyTestEnquiry = lazyLoad(() => import('../pages/ElectricalSafetyTestEnquiry'));
const HcPreventiveMaintenanceEnquiry = lazyLoad(() => import('../pages/HcPreventiveMaintenanceEnquiry'));
const HcAmcEnquiry = lazyLoad(() => import('../pages/HcAmcEnquiry'));

const LoadingFallback = () => (
  <PageSkeleton />
);

// Live Booking Card

const UserRoutes = () => {
  const location = useLocation();

  // Enable global notifications for user
  // Global notifications are now handled by SocketProvider at App level
  // useAppNotifications('user');

  // Pages where BottomNav should be shown
  const bottomNavPages = ['/user', '/user/', '/user/my-bookings', '/user/scrap', '/user/services', '/user/cart', '/user/account', '/user/calendar', '/user/inbox'];
  const shouldShowBottomNav = bottomNavPages.includes(location.pathname);

  // Check if we hide the live booking card (e.g. if we are on the specific booking details or track page)
  const isBookingDetailsPage = location.pathname.match(/^\/user\/booking\/[a-zA-Z0-9]+(\/track)?$/) || location.pathname.includes('/technician-found');
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
            <AnimatePresence mode="wait">
            <Routes location={location || undefined} key={location ? location.pathname : 'routes'}>
              {/* Public routes */}
              <Route path="/login" element={<AnimatedPage><PublicRoute userType="user"><Login /></PublicRoute></AnimatedPage>} />
              <Route path="/signup" element={<AnimatedPage><PublicRoute userType="user"><Signup /></PublicRoute></AnimatedPage>} />

              {/* Protected routes (auth required) */}
              <Route path="/" element={<AnimatedPage><ProtectedRoute userType="user"><Home /></ProtectedRoute></AnimatedPage>} />
              <Route path="/home" element={<AnimatedPage><ProtectedRoute userType="user"><Home /></ProtectedRoute></AnimatedPage>} />
              <Route path="/services" element={<AnimatedPage><ProtectedRoute userType="user"><Services /></ProtectedRoute></AnimatedPage>} />
              <Route path="/service/:slug" element={<AnimatedPage><ProtectedRoute userType="user"><OneTimeServiceDetail /></ProtectedRoute></AnimatedPage>} />
              <Route path="/service/:slug/packages" element={<AnimatedPage><ProtectedRoute userType="user"><OneTimeServicePackages /></ProtectedRoute></AnimatedPage>} />
              <Route path="/one-time-checkout" element={<AnimatedPage><ProtectedRoute userType="user"><OneTimeServiceCheckout /></ProtectedRoute></AnimatedPage>} />
              <Route path="/checkout" element={<AnimatedPage><ProtectedRoute userType="user"><Checkout /></ProtectedRoute></AnimatedPage>} />
              <Route path="/categories/:slug" element={<AnimatedPage><ProtectedRoute userType="user"><CategoryDetails /></ProtectedRoute></AnimatedPage>} />
              <Route path="/workers/match" element={<AnimatedPage><ProtectedRoute userType="user"><WorkerSelection /></ProtectedRoute></AnimatedPage>} />
              <Route path="/native" element={<AnimatedPage><ProtectedRoute userType="user"><Native /></ProtectedRoute></AnimatedPage>} />

              <Route path="/rewards" element={<AnimatedPage><ProtectedRoute userType="user"><Rewards /></ProtectedRoute></AnimatedPage>} />
              <Route path="/account" element={<AnimatedPage><ProtectedRoute userType="user"><Account /></ProtectedRoute></AnimatedPage>} />
              <Route path="/cart" element={<AnimatedPage><ProtectedRoute userType="user"><Cart /></ProtectedRoute></AnimatedPage>} />
              <Route path="/checkout" element={<AnimatedPage><ProtectedRoute userType="user"><Checkout /></ProtectedRoute></AnimatedPage>} />
              <Route path="/my-bookings" element={<AnimatedPage><ProtectedRoute userType="user"><MyBookings /></ProtectedRoute></AnimatedPage>} />
              <Route path="/calendar" element={<AnimatedPage><ProtectedRoute userType="user"><Calendar /></ProtectedRoute></AnimatedPage>} />
              <Route path="/inbox" element={<AnimatedPage><ProtectedRoute userType="user"><Inbox /></ProtectedRoute></AnimatedPage>} />
              <Route path="/one-time-review" element={<AnimatedPage><ProtectedRoute userType="user"><ReviewBooking /></ProtectedRoute></AnimatedPage>} />
              <Route path="/booking/searching/:bookingId" element={<AnimatedPage><ProtectedRoute userType="user"><SearchingTechnician /></ProtectedRoute></AnimatedPage>} />
              <Route path="/booking/technician-found/:bookingId" element={<AnimatedPage><ProtectedRoute userType="user"><TechnicianFound /></ProtectedRoute></AnimatedPage>} />
              <Route path="/booking/:id" element={<AnimatedPage><ProtectedRoute userType="user"><BookingDetails /></ProtectedRoute></AnimatedPage>} />
              <Route path="/booking/:id/track" element={<AnimatedPage><ProtectedRoute userType="user"><BookingTrack /></ProtectedRoute></AnimatedPage>} />
              <Route path="/booking-confirmation/:id" element={<AnimatedPage><ProtectedRoute userType="user"><BookingConfirmation /></ProtectedRoute></AnimatedPage>} />
              <Route path="/settings" element={<AnimatedPage><ProtectedRoute userType="user"><Settings /></ProtectedRoute></AnimatedPage>} />
              <Route path="/manage-payment-methods" element={<AnimatedPage><ProtectedRoute userType="user"><ManagePaymentMethods /></ProtectedRoute></AnimatedPage>} />
              <Route path="/manage-addresses" element={<AnimatedPage><ProtectedRoute userType="user"><ManageAddresses /></ProtectedRoute></AnimatedPage>} />
              <Route path="/wallet" element={<AnimatedPage><ProtectedRoute userType="user"><Wallet /></ProtectedRoute></AnimatedPage>} />
              <Route path="/my-plan" element={<AnimatedPage><ProtectedRoute userType="user"><MyPlan /></ProtectedRoute></AnimatedPage>} />
              <Route path="/my-plan/:id" element={<AnimatedPage><ProtectedRoute userType="user"><PlanDetails /></ProtectedRoute></AnimatedPage>} />
              <Route path="/my-rating" element={<AnimatedPage><ProtectedRoute userType="user"><MyRating /></ProtectedRoute></AnimatedPage>} />
              <Route path="/about-wbi" element={<AnimatedPage><ProtectedRoute userType="user"><AboutWBI /></ProtectedRoute></AnimatedPage>} />
              <Route path="/update-profile" element={<AnimatedPage><ProtectedRoute userType="user"><UpdateProfile /></ProtectedRoute></AnimatedPage>} />
              <Route path="/scrap" element={<AnimatedPage><ProtectedRoute userType="user"><Scrap /></ProtectedRoute></AnimatedPage>} />
              <Route path="/scrap/add" element={<AnimatedPage><ProtectedRoute userType="user"><AddScrap /></ProtectedRoute></AnimatedPage>} />
              <Route path="/notifications" element={<AnimatedPage><ProtectedRoute userType="user"><Notifications /></ProtectedRoute></AnimatedPage>} />
              <Route path="/help-support" element={<AnimatedPage><ProtectedRoute userType="user"><HelpSupport /></ProtectedRoute></AnimatedPage>} />
              <Route path="/cancellation-policy" element={<AnimatedPage><ProtectedRoute userType="user"><CancellationPolicy /></ProtectedRoute></AnimatedPage>} />
              <Route path="/web-development-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><WebDevelopmentEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/app-development-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><AppDevelopmentEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/crm-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><CrmEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/marketing-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><MarketingEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/design-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><DesignEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/banking-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><BankingEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/installation-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><InstallationEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/maintenance-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><MaintenanceEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/breakdown-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><BreakdownEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/sitetesting-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><SiteTestingEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/powermonitoring-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><PowerMonitoringEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/multipleservices-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><MultipleServicesEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/atmservice-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><AtmServiceEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/atmcassette-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><AtmCassetteService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/passbookprinter-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><PassbookPrinterService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/cdm-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><CdmService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/pos-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><PosService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/vsat-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><VsatService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/barcode-reader-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><BarcodeReaderService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/dg-service-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><DgService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/battery-service-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><BatteryService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/ups-battery-service-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><UpsBatteryService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/ev-service-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><EvService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/ac-power-service-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><AcPowerService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/dc-power-service-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><DcPowerService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/power-testing-service-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><PowerTestingService /></ProtectedRoute></AnimatedPage>} />
              <Route path="/medical-equipment-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><MedicalEquipmentEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/qc-test-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><QualityControlTestEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/safety-test-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><ElectricalSafetyTestEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/hc-pm-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><HcPreventiveMaintenanceEnquiry /></ProtectedRoute></AnimatedPage>} />
              <Route path="/hc-amc-enquiry" element={<AnimatedPage><ProtectedRoute userType="user"><HcAmcEnquiry /></ProtectedRoute></AnimatedPage>} />
              
              {/* Catch-all redirect to prevent blank screens */}
              <Route path="*" element={<AnimatedPage><ProtectedRoute userType="user"><Home /></ProtectedRoute></AnimatedPage>} />
            </Routes>
            </AnimatePresence>
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

