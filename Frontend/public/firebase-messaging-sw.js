/**
 * Firebase Messaging Service Worker
 * Handles background push notifications with sound alerts
 * Like Ola/Uber/Rapido - works even when app is closed
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration - Production values
const firebaseConfig = {
  apiKey: 'AIzaSyB0p9BwQh6P4U6RpNI783Mf2yLV96ZFemo',
  authDomain: 'WBI-notifications.firebaseapp.com',
  projectId: 'WBI-notifications',
  storageBucket: 'WBI-notifications.firebasestorage.app',
  messagingSenderId: '330091938710',
  appId: '1:330091938710:web:b58aa8c0830445b1fa53b7',
  measurementId: 'G-E493PBZLED'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Notification sounds based on type
const NOTIFICATION_SOUNDS = {
  new_booking: '/booking-alert.mp3',
  booking_accepted: '/success.mp3',
  worker_assigned: '/notification.mp3',
  job_assigned: '/booking-alert.mp3',
  booking_completed: '/success.mp3',
  default: '/notification.mp3'
};

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] ðŸ”” Background message received:', payload);

  const data = payload.data || {};
  const notification = payload.notification || {};
  const notificationType = data.type || 'default';

  // Determine notification style based on type
  // Prioritize data properties for data-only notifications
  let notificationTitle = data.title || notification.title;
  let notificationBody = data.body || notification.body;

  // If absolutely no content, do not show notification (prevent empty bubbles)
  if (!notificationTitle && !notificationBody) {
    console.log('[SW] ðŸš« Skipping empty notification');
    return;
  }

  // Default fallbacks if one is missing
  notificationTitle = notificationTitle || 'App Notification';
  notificationBody = notificationBody || 'You have a new update.';

  let icon = data.icon || notification.icon || '/WBI-logo.png';
  let badge = '/WBI-logo.png';
  let tag = data.bookingId || `notification-${Date.now()}`;
  let requireInteraction = false;
  let vibrate = [200, 100, 200];
  let actions = [];

  // Enhanced styling for different notification types
  switch (notificationType) {
    case 'booking_requested':
      notificationTitle = notificationTitle || 'ðŸ“… Booking Created!';
      notificationBody = notificationBody || 'Your service request has been received.';
      vibrate = [200, 100];
      actions = [
        { action: 'view', title: 'ðŸ‘ï¸ View Status' }
      ];
      break;

    case 'new_booking':
      // High priority booking alert - like Ola/Uber
      notificationTitle = data.title || notification.title || 'ðŸ”” New Booking Request!';
      notificationBody = data.body || notification.body || 'You have a new service request.';
      requireInteraction = true; // Keep notification visible until user interacts
      vibrate = [500, 200, 500, 200, 500]; // Strong vibration pattern
      actions = [
        { action: 'accept', title: 'âœ“ Accept', icon: '/icons/accept.png' },
        { action: 'reject', title: 'âœ— Decline', icon: '/icons/reject.png' }
      ];
      break;

    case 'job_assigned':
      // Worker job assignment - urgent
      notificationTitle = data.title || notification.title || 'ðŸ”” New Job Assigned!';
      notificationBody = data.body || notification.body || 'You have been assigned a new job.';
      requireInteraction = true;
      vibrate = [500, 200, 500, 200, 500];
      actions = [
        { action: 'accept', title: 'âœ“ Accept Job', icon: '/icons/accept.png' },
        { action: 'view', title: 'ðŸ‘ï¸ View Details' }
      ];
      break;

    case 'booking_accepted':
      notificationTitle = data.title || notification.title || 'âœ… Booking Confirmed!';
      notificationBody = data.body || notification.body || 'Your booking has been accepted.';
      vibrate = [200, 100, 200];
      actions = [
        { action: 'view', title: 'ðŸ‘ï¸ View Booking' }
      ];
      break;

    case 'worker_assigned':
      notificationTitle = data.title || notification.title || 'ðŸ‘· Worker Assigned';
      notificationBody = data.body || notification.body || 'A professional has been assigned to your booking.';
      vibrate = [200, 100, 200];
      actions = [
        { action: 'track', title: 'ðŸ“ Track Worker' }
      ];
      break;

    case 'journey_started':
    case 'worker_started':
      notificationTitle = data.title || notification.title || 'ðŸ“ Professional is on the way!';
      notificationBody = data.body || notification.body || 'Your service provider has started their journey.';
      requireInteraction = true;
      vibrate = [500, 200, 500];
      actions = [
        { action: 'track', title: 'ðŸ“ Track Arrival', icon: '/icons/track.png' }
      ];
      break;

    case 'work_done':
    case 'worker_completed':
      notificationTitle = data.title || notification.title || 'âœ… Work Finished!';
      notificationBody = data.body || notification.body || 'Professional has finished the work and is preparing the bill.';
      requireInteraction = true;
      vibrate = [200, 100, 200, 100, 200];
      actions = [
        { action: 'view', title: 'ðŸ‘ï¸ View Summary' }
      ];
      break;

    case 'booking_completed':
      notificationTitle = data.title || notification.title || 'ðŸŽ‰ Booking Completed!';
      notificationBody = data.body || notification.body || 'Service has been completed successfully.';
      vibrate = [200, 100, 200, 100, 200];
      actions = [
        { action: 'rate', title: 'â­ Rate Now' }
      ];
      break;
  }

  const notificationOptions = {
    body: notificationBody,
    icon: icon,
    badge: badge,
    tag: tag,
    sound: NOTIFICATION_SOUNDS[notificationType] || NOTIFICATION_SOUNDS.default,
    data: {
      ...data,
      notificationType: notificationType,
      url: data.link || '/',
      timestamp: Date.now()
    },
    // Vibration pattern for mobile devices
    vibrate: vibrate,
    // Keep notification until user interacts (for important ones)
    requireInteraction: requireInteraction,
    // Action buttons
    actions: actions,
    // Sound will be played by the system for high priority
    silent: false,
    // Renotify even if same tag exists
    renotify: true,
    // Timestamp
    timestamp: Date.now()
  };

  // Show the notification ONLY if app is not in foreground (to avoid duplicate with in-app socket toast)
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(function (clientList) {
      const isVisible = clientList.some(function (client) {
        return client.visibilityState === 'visible';
      });

      if (isVisible) {
        console.log('[SW] ðŸš« App is visible, skipping system notification to avoid duplicate');
        return;
      }

      return self.registration.showNotification(notificationTitle, notificationOptions);
    })
    .catch(function (err) {
      console.error('[SW] âš ï¸ Error checking clients, falling back to notification:', err);
      return self.registration.showNotification(notificationTitle, notificationOptions);
    });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] ðŸ“± Notification clicked:', event.action, event.notification.data);

  const notification = event.notification;
  const data = notification.data || {};
  const action = event.action;

  // Close the notification
  notification.close();

  let urlToOpen = data.url || data.link || '/';

  // Handle different actions
  switch (action) {
    case 'accept':
      // Accept booking/job - navigate to details page
      if (data.bookingId) {
        if (data.notificationType === 'job_assigned') {
          urlToOpen = `/worker/job/${data.bookingId}`;
        } else {
          urlToOpen = `/vendor/bookings/${data.bookingId}`;
        }
      }
      break;

    case 'reject':
    case 'decline':
      // User rejected - just close notification
      return;

    case 'view':
    case 'track':
      // View details
      if (data.bookingId) {
        urlToOpen = data.link || `/user/booking/${data.bookingId}`;
      }
      break;

    case 'rate':
      // Navigate to rating page
      if (data.bookingId) {
        urlToOpen = `/user/booking/${data.bookingId}?rate=true`;
      }
      break;

    default:
      // Default click - open the link
      urlToOpen = data.link || data.url || '/';
  }

  // Ensure URL is absolute
  const origin = self.location.origin;
  if (urlToOpen && !urlToOpen.startsWith('http')) {
    urlToOpen = new URL(urlToOpen, origin).href;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          // Navigate to the specific URL
          if (urlToOpen) {
            return client.navigate(urlToOpen);
          }
          return;
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] âŒ Notification closed:', event.notification.data);
});

// Handle push events for additional processing
self.addEventListener('push', (event) => {
  console.log('[SW] ðŸ“¨ Push event received:', event);
});

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] ðŸ“¦ Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] âœ… Service Worker activated');
  event.waitUntil(clients.claim());
});

console.log('[SW] ðŸš€ Firebase Messaging Service Worker loaded');
