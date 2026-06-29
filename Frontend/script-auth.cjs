const fs = require('fs');
const file = 'c:/Users/XIAOMI/WBI/Frontend/src/services/authService.js';
let content = fs.readFileSync(file, 'utf8');

// The user wants 'role' and 'platform' explicitly added dynamically.
// We can modify the api.post calls to include them.

// For userAuthService
content = content.replace(
  /api\.post\('\/users\/auth\/verify-login', data\);/,
  "api.post('/users/auth/verify-login', { ...data, role: 'user', platform: getPlatformType() });"
);
content = content.replace(
  /api\.post\('\/users\/auth\/register', data\);/,
  "api.post('/users/auth/register', { ...data, role: 'user', platform: getPlatformType() });"
);
content = content.replace(
  /api\.post\('\/users\/auth\/login', data\);/,
  "api.post('/users/auth/login', { ...data, role: 'user', platform: getPlatformType() });"
);

// For vendorAuthService
content = content.replace(
  /api\.post\('\/vendors\/auth\/verify-login', data\);/,
  "api.post('/vendors/auth/verify-login', { ...data, role: 'vendor', platform: getPlatformType() });"
);
content = content.replace(
  /api\.post\('\/vendors\/auth\/register', data\);/,
  "api.post('/vendors/auth/register', { ...data, role: 'vendor', platform: getPlatformType() });"
);
content = content.replace(
  /api\.post\('\/vendors\/auth\/login', data\);/,
  "api.post('/vendors/auth/login', { ...data, role: 'vendor', platform: getPlatformType() });"
);

// For workerAuthService
content = content.replace(
  /api\.post\('\/workers\/auth\/verify-login', data\);/,
  "api.post('/workers/auth/verify-login', { ...data, role: 'worker', platform: getPlatformType() });"
);
content = content.replace(
  /api\.post\('\/workers\/auth\/register', data\);/,
  "api.post('/workers/auth/register', { ...data, role: 'worker', platform: getPlatformType() });"
);
content = content.replace(
  /api\.post\('\/workers\/auth\/login', data\);/,
  "api.post('/workers/auth/login', { ...data, role: 'worker', platform: getPlatformType() });"
);

// For engineerAuthService
content = content.replace(
  /api\.post\('\/engineers\/auth\/verify-login', data\);/,
  "api.post('/engineers/auth/verify-login', { ...data, role: 'engineer', platform: getPlatformType() });"
);
content = content.replace(
  /api\.post\('\/engineers\/auth\/register', data\);/,
  "api.post('/engineers/auth/register', { ...data, role: 'engineer', platform: getPlatformType() });"
);
content = content.replace(
  /api\.post\('\/engineers\/auth\/login', data\);/,
  "api.post('/engineers/auth/login', { ...data, role: 'engineer', platform: getPlatformType() });"
);

// Modify notifyFlutterLogin to explicitly include platform and role if they aren't there
content = content.replace(
  /function notifyFlutterLogin\(responseData\) \{[\s\S]*?body: responseData[\s\S]*?\}\)/,
  `function notifyFlutterLogin(responseData) {
  try {
    const platform = getPlatformType();
    const role = responseData.role || responseData?.user?.role || localStorage.getItem('role') || 'unknown';
    
    // Add platform explicitly if missing
    const body = {
      ...responseData,
      platform,
      role
    };

    if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
      window.flutter_inappwebview.callHandler('captureLoginResponse', JSON.stringify({
        url: '/auth/login',
        body
      }));
    }`
);

fs.writeFileSync(file, content);
console.log('authService updated');
