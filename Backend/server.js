const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first"); 

// Server Entry Point
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const rateLimiter = require('./middleware/rateLimiter');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

// Initialize Redis (if enabled)
const { initRedis } = require('./services/redisService');
initRedis();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows images/assets
  contentSecurityPolicy: false, // Often conflicts with React if not configured perfectly
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' }, // Prevent clickjacking
  hidePoweredBy: true, // Hide Express
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // Enforce HTTPS
  ieNoOpen: true,
  noSniff: true, // Prevent MIME type sniffing
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true // Basic XSS protection
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://www.WBI.in',
  'https://WBI.in',
  'https://api.WBI.in'
];

if (process.env.FRONTEND_URL) {
  // Support comma-separated URLs in .env
  const envOrigins = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  envOrigins.forEach(origin => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow allowedOrigins or any Vercel preview URL for this project
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('BLOCKED CORS ORIGIN:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// CORS configuration finished above

// CORS configuration finished above

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//For camera clicks feature 
// app.use(express.json({ limit: "20mb" })); // REMOVED redundant
// app.use(express.urlencoded({ extended: true, limit: "20mb" })); // REMOVED redundant

// DEBUG: Log Booking Request Body
app.use('/api/users/bookings', (req, res, next) => {
  if (req.method === 'POST') {
    console.log('DEBUG: POST /api/users/bookings BODY:', JSON.stringify(req.body, null, 2));
  }
  next();
});
// (Old Vendor Register Logger Removed)



// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', {
    skip: function (req, res) { return res.statusCode === 304 }
  }));
}

// Rate limiting
app.use('/api', rateLimiter);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'WBI API is running',
    timestamp: new Date().toISOString()
  });
});

// Quick Redis Test Route
app.get('/api/test/redis', async (req, res) => {
  try {
    const { getRedis, isRedisConnected } = require('./services/redisService');
    const redis = getRedis();

    if (!isRedisConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Redis is not connected or disabled',
        redisEnabled: process.env.REDIS_ENABLED === 'true',
        status: redis ? redis.status : 'no_instance'
      });
    }

    const testKey = `test:time:${Date.now()}`;
    const testValue = 'Hello from Redis!';

    // Test Set
    await redis.set(testKey, testValue, 'EX', 60);

    // Test Get
    const retrievedValue = await redis.get(testKey);

    // Test Delete
    const deleted = await redis.del(testKey);

    res.json({
      success: true,
      message: 'Redis is working correctly',
      testResults: {
        set: 'Retrieved value: ' + retrievedValue,
        match: retrievedValue === testValue,
        delete: deleted === 1 ? 'Success' : 'Failed'
      },
      connectionInfo: {
        status: redis.status,
        host: redis.options.host
      }
    });
  } catch (error) {
    console.error('[Redis Test Route] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Redis test failed',
      error: error.message
    });
  }
});

// API Routes

app.use('/api/service-categories', require('./routes/public-routes/serviceCategory.routes'));
app.use('/api/public/cities', require('./routes/public-routes/city.routes.js'));
app.use('/api/public/crm-enquiries', require('./routes/public-routes/crmEnquiry.routes'));
app.use('/api/public/marketing-enquiries', require('./routes/public-routes/marketingEnquiry.routes'));
app.use('/api/public/design-enquiries', require('./routes/public-routes/designEnquiry.routes'));
app.use('/api/public/web-enquiries', require('./routes/public-routes/webEnquiry.routes'));
app.use('/api/public/app-enquiries', require('./routes/public-routes/appEnquiry.routes'));
app.use('/api/public/banking-enquiries', require('./routes/public-routes/bankingEnquiry.routes'));
app.use('/api/public/installation-enquiries', require('./routes/public-routes/installationEnquiry.routes'));
app.use('/api/public/maintenance-enquiries', require('./routes/public-routes/maintenanceEnquiry.routes'));
app.use('/api/public/breakdown-enquiries', require('./routes/public-routes/breakdownEnquiry.routes'));


// User routes
app.use('/api/users/auth', require('./routes/user-routes/auth.routes'));
app.use('/api/users', require('./routes/user-routes/profile.routes'));
app.use('/api/user/wallet', require('./routes/user-routes/userWallet.routes'));
app.use('/api/users/bookings', require('./routes/user-routes/booking.routes'));
app.use('/api/users', require('./routes/user-routes/cart.routes'));
app.use('/api/users/fcm-tokens', require('./routes/user-routes/fcmToken.routes'));
app.use('/api/users/reviews', require('./routes/user-routes/review.routes'));

// Scrap routes
const scrapRoutes = require('./routes/scrap.routes');
app.use('/api/scrap', scrapRoutes);

// Vendor routes
app.use('/api/vendors/auth', require('./routes/vendor-routes/auth.routes'));
app.use('/api/vendors', require('./routes/vendor-routes/profile.routes'));
app.use('/api/vendors', require('./routes/vendor-routes/settings.routes'));
app.use('/api/vendors', require('./routes/vendor-routes/wallet.routes'));
app.use('/api/vendors', require('./routes/vendor-routes/dashboard.routes'));
app.use('/api/vendors', require('./routes/vendor-routes/service.routes'));
app.use('/api/vendors/bookings', require('./routes/vendor-routes/booking.routes'));
app.use('/api/vendors/workers', require('./routes/vendor-routes/worker.routes'));
app.use('/api/vendors/fcm-tokens', require('./routes/vendor-routes/fcmToken.routes'));
app.use('/api/vendors', require('./routes/vendor-routes/vendorBill.routes'));
app.use('/api/vendors/catalog', require('./routes/vendor-routes/catalog.routes'));
app.use('/api/vendors/enquiries', require('./routes/vendor-routes/vendorEnquiry.routes'));
app.use('/api/vendors/assignments', require('./routes/vendor-routes/engineerAssignment.routes'));
app.use('/api/vendors/team', require('./routes/vendor-routes/team.routes'));
app.use('/api/vendors/digital', require('./routes/vendor-routes/digital.routes'));

// Worker routes
app.use('/api/workers/auth', require('./routes/worker-routes/auth.routes'));
app.use('/api/workers', require('./routes/worker-routes/profile.routes'));
app.use('/api/workers', require('./routes/worker-routes/job.routes'));
app.use('/api/workers', require('./routes/worker-routes/dashboard.routes'));
app.use('/api/workers/wallet', require('./routes/worker-routes/wallet.routes'));
app.use('/api/workers/fcm-tokens', require('./routes/worker-routes/fcmToken.routes'));
app.use('/api/workers/projects', require('./routes/worker-routes/project.routes'));

// Engineer routes
app.use('/api/engineers/auth', require('./routes/engineer-routes/auth.routes'));
app.use('/api/engineers', require('./routes/engineer-routes/profile.routes'));
app.use('/api/engineers', require('./routes/engineer-routes/job.routes'));
app.use('/api/engineers', require('./routes/engineer-routes/dashboard.routes'));
app.use('/api/engineers/wallet', require('./routes/engineer-routes/wallet.routes'));
app.use('/api/engineers/fcm-tokens', require('./routes/engineer-routes/fcmToken.routes'));
app.use('/api/engineers/projects', require('./routes/engineer-routes/project.routes'));
app.use('/api/engineers/execution', require('./routes/engineer-routes/engineerJobExecution.routes'));
app.use('/api/engineers/digital', require('./routes/engineer-routes/digital.routes'));

// Admin routes
app.use('/api/admin/auth', require('./routes/admin-routes/adminAuth.routes'));
app.use('/api/admin', require('./routes/admin-routes/cityManagement.routes.js'));
app.use('/api/admin', require('./routes/admin-routes/dashboard.routes'));
app.use('/api/admin', require('./routes/admin-routes/userManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/vendorManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/workerManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/engineerManagement.routes'));
app.use('/api/admin/service-categories', require('./routes/admin-routes/serviceCategoryManagement.routes'));
app.use('/api/admin/sub-services', require('./routes/admin-routes/subServiceManagement.routes'));
app.use('/api/admin/dynamic-form-configs', require('./routes/admin-routes/dynamicFormConfig.routes'));

// Shared routes (e.g. unified forgot password)
app.use('/api/auth', require('./routes/shared/auth.routes'));
app.use('/api/admin/job-checklist-configs', require('./routes/admin-routes/jobChecklistConfig.routes'));
app.use('/api/admin', require('./routes/admin-routes/categoryManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/brandManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/serviceManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/vendorCatalogManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/homePageManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/bookingManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/paymentManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/transactionManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/upload.routes'));
app.use('/api/admin', require('./routes/admin-routes/planManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/settings.routes'));
app.use('/api/admin', require('./routes/admin-routes/reviewManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/trustVideoManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/reportManagement.routes'));
app.use('/api/admin/settlements', require('./routes/admin-routes/settlementManagement.routes'));
app.use('/api/admin/admins', require('./routes/admin-routes/adminManagement.routes'));
app.use('/api/admin', require('./routes/admin-routes/formBuilder.routes'));
app.use('/api/admin/web-enquiries', require('./routes/admin-routes/webEnquiryAdmin.routes'));
app.use('/api/admin/app-enquiries', require('./routes/admin-routes/appEnquiry.routes'));
app.use('/api/admin/crm-enquiries', require('./routes/admin-routes/crmEnquiry.routes'));
app.use('/api/admin/marketing-enquiries', require('./routes/admin-routes/marketingEnquiry.routes'));
app.use('/api/admin/design-enquiries', require('./routes/admin-routes/designEnquiry.routes'));
app.use('/api/admin/banking-enquiries', require('./routes/admin-routes/bankingEnquiryAdmin.routes'));
app.use('/api/admin/installation-enquiries', require('./routes/admin-routes/installationEnquiry.routes'));
app.use('/api/admin/maintenance-enquiries', require('./routes/admin-routes/maintenanceEnquiry.routes'));
app.use('/api/admin/breakdown-enquiries', require('./routes/admin-routes/breakdownEnquiry.routes'));
app.use('/api/admin/sitetesting-enquiries', require('./routes/admin-routes/siteTestingEnquiry.routes'));
app.use('/api/admin/powermonitoring-enquiries', require('./routes/admin-routes/automatedPowerMonitoringEnquiry.routes'));
app.use('/api/admin/multipleservices-enquiries', require('./routes/admin-routes/multipleServicesEnquiry.routes'));
app.use('/api/admin/atmservice-enquiries', require('./routes/admin-routes/atmServiceEnquiry.routes'));
app.use('/api/admin/atmcassette-enquiries', require('./routes/admin-routes/atmCassetteService.routes'));
app.use('/api/admin/passbookprinter-enquiries', require('./routes/admin-routes/passbookPrinterService.routes'));
app.use('/api/admin/cdmservice-enquiries', require('./routes/admin-routes/cdmService.routes'));
app.use('/api/admin/posservice-enquiries', require('./routes/admin-routes/posService.routes'));
app.use('/api/admin/vsatservice-enquiries', require('./routes/admin-routes/vsatService.routes'));
app.use('/api/admin/barcodereaderservice-enquiries', require('./routes/admin-routes/barcodeReaderService.routes'));

// Energy Solutions Routes - Admin
app.use('/api/admin/dgservice-enquiries', require('./routes/admin-routes/dgService.routes'));
app.use('/api/admin/batteryservice-enquiries', require('./routes/admin-routes/batteryService.routes'));
app.use('/api/admin/upsbatteryservice-enquiries', require('./routes/admin-routes/upsBatteryService.routes'));
app.use('/api/admin/evservice-enquiries', require('./routes/admin-routes/evService.routes'));
app.use('/api/admin/acpowerservice-enquiries', require('./routes/admin-routes/acPowerService.routes'));
app.use('/api/admin/dcpowerservice-enquiries', require('./routes/admin-routes/dcPowerService.routes'));
app.use('/api/admin/powertestingservice-enquiries', require('./routes/admin-routes/powerTestingService.routes'));

// Healthcare Solutions Routes - Admin
app.use('/api/admin/medicalequipment-enquiries', require('./routes/admin-routes/medicalEquipment.routes'));
app.use('/api/admin/qctest-enquiries', require('./routes/admin-routes/qcTest.routes'));
app.use('/api/admin/safetytest-enquiries', require('./routes/admin-routes/safetyTest.routes'));
app.use('/api/admin/hcpm-enquiries', require('./routes/admin-routes/hcPm.routes'));
app.use('/api/admin/hcamc-enquiries', require('./routes/admin-routes/hcAmc.routes'));

app.use('/api/image', require('./routes/admin-routes/image.routes'));
app.use('/api', require('./routes/admin-routes/upload.routes')); // Generic upload access

// Vendor Wallet/Ledger routes
// Vendor Wallet/Ledger routes
// WARNING: This mounts at /api/vendors, meaning routes inside are relative to that.
// e.g., router.post('/withdrawal') becomes /api/vendors/withdrawal
app.use('/api/vendors', require('./routes/vendor-routes/vendorWallet.routes'));

// Booking routes
app.use('/api/bookings', require('./routes/booking-routes/userBooking.routes'));
app.use('/api/bookings/cash', require('./routes/booking-routes/cashCollection.routes'));

// Payment routes
app.use('/api/payments', require('./routes/payment-routes/payment.routes'));

// Notification routes
app.use('/api/notifications', require('./routes/notification.routes'));

// Public routes (no authentication required)
app.use('/api/public', require('./routes/public-routes/catalog.routes'));
app.use('/api/public', require('./routes/public-routes/plan.routes'));
app.use('/api/public/web-enquiries', require('./routes/public-routes/webEnquiry.routes'));
app.use('/api/public/app-enquiries', require('./routes/public-routes/appEnquiry.routes'));
app.use('/api/public', require('./routes/public-routes/config.routes'));
app.use('/api/public/dynamic-enquiries', require('./routes/public-routes/dynamicEnquiry.routes'));
app.use('/api/public/dynamic-payments', require('./routes/public-routes/dynamicPayment.routes'));
app.use('/api/public', require('./routes/public-routes/trustVideo.routes'));
app.use('/api/public/reviews', require('./routes/public-routes/review.routes'));
app.use('/api/public/web-enquiries', require('./routes/public-routes/webEnquiry.routes'));
app.use('/api/public/banking-enquiries', require('./routes/public-routes/bankingEnquiry.routes'));
app.use('/api/forms', require('./routes/public-routes/form.routes'));

// --- PUBLIC ROUTES (No auth required) ---
// app.use('/api/public/sub-service-management', require('./routes/public-routes/subServiceManagement.routes'));

// Multiple Services Public Route
app.use('/api/public/multiple-services-enquiries', require('./routes/public-routes/multipleServicesEnquiry.routes'));
app.use('/api/public/power-monitoring-enquiries', require('./routes/public-routes/automatedPowerMonitoringEnquiry.routes'));

// Contact and Core Service Enquiries
app.use('/api/public/service-categories', require('./routes/public-routes/serviceCategory.routes'));
app.use('/api/public/installation-enquiries', require('./routes/public-routes/installationEnquiry.routes'));
app.use('/api/public/marketing-enquiries', require('./routes/public-routes/marketingEnquiry.routes'));
app.use('/api/public/design-enquiries', require('./routes/public-routes/designEnquiry.routes'));
app.use('/api/public/breakdown-enquiries', require('./routes/public-routes/breakdownEnquiry.routes'));
app.use('/api/public/sitetesting-enquiries', require('./routes/public-routes/siteTestingEnquiry.routes'));

// Banking Service Enquiries (Public)
app.use('/api/public/atm-cassette-service-enquiries', require('./routes/public-routes/atmCassetteService.routes'));
app.use('/api/public/atm-service-enquiries', require('./routes/public-routes/atmServiceEnquiry.routes'));
app.use('/api/public/passbookprinter-enquiries', require('./routes/public-routes/passbookPrinterService.routes'));
app.use('/api/public/cdmservice-enquiries', require('./routes/public-routes/cdmService.routes'));
app.use('/api/public/posservice-enquiries', require('./routes/public-routes/posService.routes'));
app.use('/api/public/vsatservice-enquiries', require('./routes/public-routes/vsatService.routes'));
app.use('/api/public/barcodereaderservice-enquiries', require('./routes/public-routes/barcodeReaderService.routes'));

// Energy Solutions Routes - Public
app.use('/api/public/dgservice-enquiries', require('./routes/public-routes/dgService.routes'));
app.use('/api/public/batteryservice-enquiries', require('./routes/public-routes/batteryService.routes'));
app.use('/api/public/upsbatteryservice-enquiries', require('./routes/public-routes/upsBatteryService.routes'));
app.use('/api/public/evservice-enquiries', require('./routes/public-routes/evService.routes'));
app.use('/api/public/acpowerservice-enquiries', require('./routes/public-routes/acPowerService.routes'));
app.use('/api/public/dcpowerservice-enquiries', require('./routes/public-routes/dcPowerService.routes'));
app.use('/api/public/powertestingservice-enquiries', require('./routes/public-routes/powerTestingService.routes'));

// Healthcare Solutions Routes - Public
app.use('/api/public/medicalequipment-enquiries', require('./routes/public-routes/medicalEquipment.routes'));
app.use('/api/public/qctest-enquiries', require('./routes/public-routes/qcTest.routes'));
app.use('/api/public/safetytest-enquiries', require('./routes/public-routes/safetyTest.routes'));
app.use('/api/public/hcpm-enquiries', require('./routes/public-routes/hcPm.routes'));
app.use('/api/public/hcamc-enquiries', require('./routes/public-routes/hcAmc.routes'));

// 404 handler
app.use((req, res) => {
  console.log(`[404 HANDLER] Route not found - Method: ${req.method}, Path: ${req.path}, OriginalUrl: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    method: req.method,
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize Socket.io
let server;
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Initialize Socket.io
  const { initializeSocket, getIO } = require('./sockets');
  initializeSocket(server);

  // Make io instance available in request
  app.set('io', getIO());

  // Initialize Booking Scheduler for Wave-Based Alerting
  const { initializeScheduler } = require('./services/bookingScheduler');
  initializeScheduler(getIO());
  console.log('[Server] Booking Scheduler initialized for wave-based alerting');

  // Initialize Urgency Scheduler for 3-tier booking timeouts
  const { startUrgencyScheduler } = require('./services/urgencyScheduler');
  startUrgencyScheduler();
  console.log('[Server] Urgency Scheduler initialized');

  // Initialize BullMQ Workers for Security Solutions Flow
  require('./jobs/vendorMatchingJob');
  require('./jobs/engineerAssignmentJob');
  require('./jobs/slaMonitorJob');
  console.log('[Server] BullMQ Workers initialized');

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    server.close(() => {
      process.exit(1);
    });
  });
} else {
  // For Vercel, create HTTP server for Socket.io
  const http = require('http');
  server = http.createServer(app);
  const { initializeSocket } = require('./sockets');
  initializeSocket(server);
}

module.exports = app;





