import { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminBottomNav from './AdminBottomNav';
import useAdminHeaderHeight from '../../hooks/useAdminHeaderHeight';

const AdminPageSkeleton = () => (
  <div className="w-full h-full p-4 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="h-32 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="h-64 bg-gray-200 rounded-xl"></div>
  </div>
);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerHeight = useAdminHeaderHeight();

  // Bottom nav height is 64px (h-16)
  const bottomNavHeight = 64;

  // Add small buffer to prevent content overlap (8px)
  const topPadding = headerHeight + 8;
  const bottomPadding = bottomNavHeight + 8;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-[278px] min-w-0 max-w-full overflow-x-hidden transition-all duration-300">
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content - with dynamic padding to account for fixed header and bottom nav */}
        <main
          className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto overflow-x-hidden lg:pb-6 lg:pt-24 scrollbar-admin w-full min-w-0"
          style={{
            // Mobile: Use calculated heights with safe area support
            // Desktop: Tailwind classes override these (lg:pt-24, lg:pb-6)
            paddingTop: `${Math.max(topPadding, 80)}px`,
            paddingBottom: `calc(${Math.max(bottomPadding, 80)}px + env(safe-area-inset-bottom, 0px))`,
          }}
        >
          <div className="w-full max-w-full overflow-x-hidden min-w-0 h-full">
            <Suspense fallback={<AdminPageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <AdminBottomNav />
    </div>
  );
};

export default AdminLayout;

