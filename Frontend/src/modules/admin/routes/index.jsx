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
const Engineers = lazy(() => import('../pages/Engineers'));
const FormBuilder = lazy(() => import('../pages/FormBuilder'));
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
const CrmEnquiries = lazy(() => import('../pages/CrmEnquiries'));
const MarketingEnquiries = lazy(() => import('../pages/MarketingEnquiries'));
const DesignEnquiries = lazy(() => import('../pages/DesignEnquiries'));
const BankingEnquiries = lazy(() => import('../pages/BankingEnquiries'));
const InstallationEnquiries = lazy(() => import('../pages/InstallationEnquiries'));
const MaintenanceEnquiries = lazy(() => import('../pages/MaintenanceEnquiries'));
const BreakdownEnquiries = lazy(() => import('../pages/BreakdownEnquiries'));
const SiteTestingEnquiries = lazy(() => import('../pages/SiteTestingEnquiries'));
const PowerMonitoringEnquiries = lazy(() => import('../pages/PowerMonitoringEnquiries'));
const MultipleServicesEnquiries = lazy(() => import('../pages/MultipleServicesEnquiries'));
const AtmServiceEnquiries = lazy(() => import('../pages/AtmServiceEnquiries'));
const AtmCassetteServices = lazy(() => import('../pages/AtmCassetteServices'));
const PassbookPrinterServices = lazy(() => import('../pages/PassbookPrinterServices'));
const CdmServices = lazy(() => import('../pages/CdmServices'));
const PosServices = lazy(() => import('../pages/PosServices'));
const VsatServices = lazy(() => import('../pages/VsatServices'));
const BarcodeReaderServices = lazy(() => import('../pages/BarcodeReaderServices'));

// Energy Solutions
const DgServices = lazy(() => import('../pages/DgServices'));
const BatteryServices = lazy(() => import('../pages/BatteryServices'));
const UpsBatteryServices = lazy(() => import('../pages/UpsBatteryServices'));
const EvServices = lazy(() => import('../pages/EvServices'));
const AcPowerServices = lazy(() => import('../pages/AcPowerServices'));
const DcPowerServices = lazy(() => import('../pages/DcPowerServices'));
const PowerTestingServices = lazy(() => import('../pages/PowerTestingServices'));

// Healthcare
const MedicalEquipmentEnquiries = lazy(() => import('../pages/MedicalEquipmentEnquiries'));
const QualityControlTestEnquiries = lazy(() => import('../pages/QualityControlTestEnquiries'));
const ElectricalSafetyTestEnquiries = lazy(() => import('../pages/ElectricalSafetyTestEnquiries'));
const HcPreventiveMaintenanceEnquiries = lazy(() => import('../pages/HcPreventiveMaintenanceEnquiries'));
const HcAmcEnquiries = lazy(() => import('../pages/HcAmcEnquiries'));

const LoadingFallback = () => (
  <div className="min-h-screen"></div>
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
          <Route path="engineers/*" element={<Engineers />} />
          <Route path="form-builder/*" element={<FormBuilder />} />
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
          <Route path="crm-enquiries" element={<CrmEnquiries />} />
          <Route path="marketing-enquiries" element={<MarketingEnquiries />} />
          <Route path="design-enquiries" element={<DesignEnquiries />} />
          <Route path="banking-enquiries" element={<BankingEnquiries />} />
          
          <Route path="security-solutions/installation" element={<InstallationEnquiries />} />
          <Route path="security-solutions/maintenance" element={<MaintenanceEnquiries />} />
          <Route path="security-solutions/breakdown" element={<BreakdownEnquiries />} />
          <Route path="security-solutions/testing" element={<SiteTestingEnquiries />} />
          <Route path="security-solutions/panel-installation" element={<MultipleServicesEnquiries />} />
          <Route path="security-solutions/monitoring" element={<PowerMonitoringEnquiries />} />
          <Route path="banking-solutions/atm-service" element={<AtmServiceEnquiries />} />
          <Route path="banking-solutions/atm-cassette-service" element={<AtmCassetteServices />} />
          <Route path="banking-solutions/passbook-printer-service" element={<PassbookPrinterServices />} />
          <Route path="banking-solutions/cdm-service" element={<CdmServices />} />
          <Route path="banking-solutions/pos-service" element={<PosServices />} />
          <Route path="banking-solutions/vsat-service" element={<VsatServices />} />
          <Route path="banking-solutions/barcode-reader-service" element={<BarcodeReaderServices />} />

          <Route path="energy-solutions/dg-services" element={<DgServices />} />
          <Route path="energy-solutions/battery-services" element={<BatteryServices />} />
          <Route path="energy-solutions/ups-battery-services" element={<UpsBatteryServices />} />
          <Route path="energy-solutions/ev-services" element={<EvServices />} />
          <Route path="energy-solutions/ac-power-services" element={<AcPowerServices />} />
          <Route path="energy-solutions/dc-power-services" element={<DcPowerServices />} />
          <Route path="energy-solutions/power-testing-services" element={<PowerTestingServices />} />

          <Route path="healthcare-solutions/medical-equipment" element={<MedicalEquipmentEnquiries />} />
          <Route path="healthcare-solutions/qc-test" element={<QualityControlTestEnquiries />} />
          <Route path="healthcare-solutions/safety-test" element={<ElectricalSafetyTestEnquiries />} />
          <Route path="healthcare-solutions/preventive-maintenance" element={<HcPreventiveMaintenanceEnquiries />} />
          <Route path="healthcare-solutions/amc" element={<HcAmcEnquiries />} />

          <Route path="settlements/*" element={<Settlements />} />
          <Route path="settings/*" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;


