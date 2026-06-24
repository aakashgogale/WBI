import React, { useEffect } from 'react'; // Updated index to .jsx
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './routes';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { CityProvider } from './context/CityContext';
import { initializePushNotifications, setupForegroundNotificationHandler } from './services/pushNotificationService';
import { LocationPermissionChecker } from './components/common';
import NavigationProgress from './components/common/NavigationProgress';

// Configure a global QueryClient with aggressive caching for speed
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in memory for 10 minutes even if unmounted
      refetchOnWindowFocus: false, // Prevent unnecessary refetches when switching tabs
      retry: 1, // Only retry once to avoid blocking UI on hard failures
    },
  },
});

function App() {
  // Initialize push notifications on app load
  useEffect(() => {
    initializePushNotifications();

    // Setup foreground notification handler
    setupForegroundNotificationHandler((payload) => {
      // Dispatch update events for listening components to refresh UI
      window.dispatchEvent(new Event('vendorJobsUpdated'));
      window.dispatchEvent(new Event('vendorStatsUpdated'));
      window.dispatchEvent(new Event('workerJobsUpdated'));
      window.dispatchEvent(new Event('userBookingsUpdated'));

      // Also dispatch generic one if needed
      window.dispatchEvent(new Event('appNotificationReceived'));
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NavigationProgress />
        <SocketProvider>
          <CityProvider>
            <CartProvider>
              <div className="App">
                <AppRoutes />
                <LocationPermissionChecker />
                <Toaster
                  position="top-center"
                  reverseOrder={false}
                  toastOptions={{
                    duration: 2000, // Global default (reduced from 3000)
                    style: {
                      background: '#333',
                      color: '#fff',
                      borderRadius: '10px',
                      padding: '12px 20px',
                    },
                    success: {
                      duration: 1000, // 1 second as requested
                      style: {
                        background: '#10B981',
                      },
                    },
                    error: {
                      duration: 2000, // Reduced from 4000
                      style: {
                        background: '#EF4444',
                      },
                    },
                  }}
                />
              </div>
            </CartProvider>
          </CityProvider>
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
