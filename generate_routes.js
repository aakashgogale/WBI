const fs = require('fs');
const path = require('path');

const services = [
  'dgService', 'batteryService', 'upsBatteryService', 
  'evService', 'acPowerService', 'dcPowerService', 'powerTestingService'
];

const backendDir = 'c:/Users/XIAOMI/WBI/Backend/routes';
const publicDir = path.join(backendDir, 'public-routes');
const adminDir = path.join(backendDir, 'admin-routes');

services.forEach(service => {
  // Public Route
  const publicContent = `const express = require('express');
const router = express.Router();
const controller = require('../../controllers/${service}.controller');

// Create a new enquiry (Public)
router.post('/', controller.createEnquiry);

module.exports = router;`;
  
  fs.writeFileSync(path.join(publicDir, `${service}.routes.js`), publicContent);

  // Admin Route
  const adminContent = `const express = require('express');
const router = express.Router();
const controller = require('../../controllers/${service}.controller');
const { protect, authorize } = require('../../middlewares/auth');

// Protect all routes and restrict to admin/super_admin
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', controller.getEnquiries);
router.get('/:id', controller.getEnquiry);
router.put('/:id/status', controller.updateStatus);
router.delete('/:id', controller.deleteEnquiry);

module.exports = router;`;
  
  fs.writeFileSync(path.join(adminDir, `${service}.routes.js`), adminContent);
});

console.log('Successfully generated 14 route files');
