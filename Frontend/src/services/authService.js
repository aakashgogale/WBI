import api from './api';
import { registerFCMToken, removeFCMToken } from './pushNotificationService';

/**
 * Notify Flutter WebView about successful login
 * This directly calls Flutter's captureLoginResponse handler
 * @param {object} responseData - The login response data containing accessToken and user/vendor/worker info
 */
function notifyFlutterLogin(responseData) {
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
    }
  } catch (e) {
    console.error('[AUTH] Error notifying Flutter:', e);
  }
}

/**
 * Get the current platform type (web or mobile)
 * @returns {'web' | 'mobile'}
 */
function getPlatformType() {
  return (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) ? 'mobile' : 'web';
}

/**
 * Dynamically save authentication tokens and user details based on role.
 * @param {string} token
 * @param {string} refreshToken
 * @param {object} user
 * @param {string} role
 */
export function saveAuthSession(token, refreshToken, user, role) {
  // Save globally as requested
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);

  const prefix = ['worker', 'engineer', 'vendor', 'admin'].includes(role) ? role : '';
  if (prefix) {
    localStorage.setItem(`${prefix}AccessToken`, token);
    localStorage.setItem(`${prefix}RefreshToken`, refreshToken);
    localStorage.setItem(`${prefix}Data`, JSON.stringify(user));
  } else {
    // Default to user mapping
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userData', JSON.stringify(user));
  }
}

/**
 * Shared Authentication Service (Unified Login)
 */
export const sharedAuthService = {
  unifiedLogin: async (data) => {
    const response = await api.post('/auth/login', data);
    if (response.data.success && response.data.token) {
      const { token, refreshToken, user } = response.data;
      const role = response.data.role || (user && user.role);
      
      saveAuthSession(token, refreshToken, user, role);

      notifyFlutterLogin(response.data);
      // Register FCM Token
      registerFCMToken(role, true).catch(console.error);
    }
    return response.data;
  },
  socialLogin: async (data) => {
    // data: { token, role }
    const response = await api.post('/auth/social-login', data);
    if (response.data.success && response.data.token) {
      const { token, refreshToken, user } = response.data;
      const role = response.data.role || (user && user.role);
      
      saveAuthSession(token, refreshToken, user, role);

      notifyFlutterLogin(response.data);
      registerFCMToken(role, true).catch(console.error);
    }
    return response.data;
  }
};

/**
 * User Authentication Service
 */
export const userAuthService = {
  // Send OTP
  sendOTP: async (phone, email = null) => {
    const response = await api.post('/users/auth/send-otp', { phone, email });
    return response.data;
  },

  // Verify Login (Unified Flow)
  verifyLogin: async (data) => {
    const response = await api.post('/users/auth/verify-login', { ...data, role: 'user', platform: getPlatformType() });
    if (response.data.success && !response.data.isNewUser && response.data.accessToken) {
      const { role, accessToken, refreshToken, user } = response.data;
      
      saveAuthSession(accessToken, refreshToken, user, role);

      notifyFlutterLogin(response.data);
      registerFCMToken(role || 'user', true).catch(console.error);
    }
    return response.data;
  },

  // Register
  register: async (data) => {
    const response = await api.post('/users/auth/register', { ...data, role: 'user', platform: getPlatformType() });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      notifyFlutterLogin(response.data);
      registerFCMToken('user', true).catch(console.error);
    }
    return response.data;
  },

  // Login
  login: async (data) => {
    const response = await api.post('/users/auth/login', { ...data, role: 'user', platform: getPlatformType() });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      notifyFlutterLogin(response.data);
      registerFCMToken('user', true).catch(console.error);
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    // Remove FCM token before logout
    await removeFCMToken('user');
    try {
      await api.post('/users/auth/logout', { platform: getPlatformType() });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    if (response.data.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    if (response.data.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get checkout summary data
  getCheckoutData: async () => {
    const response = await api.get('/users/checkout-data');
    return response.data;
  }
};

/**
 * Vendor Authentication Service
 */
export const vendorAuthService = {
  // Send OTP
  sendOTP: async (phone, email = null) => {
    const response = await api.post('/vendors/auth/send-otp', { phone, email });
    return response.data;
  },

  // Verify Login (Unified Flow)
  verifyLogin: async (data) => {
    const response = await api.post('/vendors/auth/verify-login', { ...data, role: 'vendor', platform: getPlatformType() });
    if (response.data.success && !response.data.isNewUser && response.data.accessToken) {
      localStorage.setItem('vendorAccessToken', response.data.accessToken);
      localStorage.setItem('vendorRefreshToken', response.data.refreshToken);
      localStorage.setItem('vendorData', JSON.stringify(response.data.vendor));
      notifyFlutterLogin(response.data);
      registerFCMToken('vendor', true).catch(console.error);
    }
    return response.data;
  },

  // Register
  register: async (data) => {
    const response = await api.post('/vendors/auth/register', { ...data, role: 'vendor', platform: getPlatformType() });
    return response.data;
  },

  // Login
  login: async (data) => {
    // Remove email from login payload if present
    const { email, ...loginData } = data;
    const response = await api.post('/vendors/auth/login', loginData);
    if (response.data.accessToken) {
      localStorage.setItem('vendorAccessToken', response.data.accessToken);
      localStorage.setItem('vendorRefreshToken', response.data.refreshToken);
      localStorage.setItem('vendorData', JSON.stringify(response.data.vendor));
      notifyFlutterLogin(response.data);
      // Register FCM token after successful login
      console.log('[AUTH] Vendor login successful, registering FCM token...');
      try {
        const fcmToken = await registerFCMToken('vendor', true);
        if (fcmToken) {
          console.log('[AUTH] ✅ Vendor FCM token registered successfully');
        } else {
          console.log('[AUTH] ⚠️ Vendor FCM token registration returned null');
        }
      } catch (err) {
        console.error('[AUTH] ❌ Vendor FCM token registration failed:', err);
      }
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    // Remove FCM token before logout
    await removeFCMToken('vendor');
    try {
      await api.post('/vendors/auth/logout', { platform: getPlatformType() });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('vendorAccessToken');
    localStorage.removeItem('vendorRefreshToken');
    localStorage.removeItem('vendorData');
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/vendors/profile');
    if (response.data.vendor) {
      localStorage.setItem('vendorData', JSON.stringify(response.data.vendor));
    }
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/vendors/profile', data);
    if (response.data.vendor) {
      localStorage.setItem('vendorData', JSON.stringify(response.data.vendor));
    }
    return response.data;
  }
};

/**
 * Worker Authentication Service
 */
export const workerAuthService = {
  // Send OTP
  sendOTP: async (phone, email = null) => {
    const response = await api.post('/workers/auth/send-otp', { phone, email });
    return response.data;
  },

  getRegistrationConfig: async () => {
    const response = await api.get('/forms/register-config?role=worker');
    return response.data;
  },

  // Verify Login (Unified Flow)
  verifyLogin: async (data) => {
    const response = await api.post('/workers/auth/verify-login', { ...data, role: 'worker', platform: getPlatformType() });
    if (response.data.success && !response.data.isNewUser && response.data.accessToken) {
      localStorage.setItem('workerAccessToken', response.data.accessToken);
      localStorage.setItem('workerRefreshToken', response.data.refreshToken);
      localStorage.setItem('workerData', JSON.stringify(response.data.worker));
      notifyFlutterLogin(response.data);
      registerFCMToken('worker', true).catch(console.error);
    }
    return response.data;
  },

  // Register
  register: async (data) => {
    const response = await api.post('/workers/auth/register', { ...data, role: 'worker', platform: getPlatformType() });
    if (response.data.accessToken) {
      localStorage.setItem('workerAccessToken', response.data.accessToken);
      localStorage.setItem('workerRefreshToken', response.data.refreshToken);
      localStorage.setItem('workerData', JSON.stringify(response.data.worker));
      notifyFlutterLogin(response.data);
    }
    return response.data;
  },

  // Login
  login: async (data) => {
    // Remove email from login payload if present
    const { email, ...loginData } = data;
    const response = await api.post('/workers/auth/login', loginData);
    if (response.data.accessToken) {
      localStorage.setItem('workerAccessToken', response.data.accessToken);
      localStorage.setItem('workerRefreshToken', response.data.refreshToken);
      localStorage.setItem('workerData', JSON.stringify(response.data.worker));
      notifyFlutterLogin(response.data);
      registerFCMToken('worker', true).catch(console.error);
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    // Remove FCM token before logout
    await removeFCMToken('worker');
    try {
      await api.post('/workers/auth/logout', { platform: getPlatformType() });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('workerAccessToken');
    localStorage.removeItem('workerRefreshToken');
    localStorage.removeItem('workerData');
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/workers/profile');
    if (response.data.worker) {
      localStorage.setItem('workerData', JSON.stringify(response.data.worker));
    }
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/workers/profile', data);
    if (response.data.worker) {
      localStorage.setItem('workerData', JSON.stringify(response.data.worker));
    }
    return response.data;
  },

  getProfileCompletion: async () => {
    const response = await api.get('/workers/profile/completion');
    return response.data;
  },

  updateBankDetails: async (data) => {
    const response = await api.put('/workers/profile/bank-details', data);
    if (response.data.worker) localStorage.setItem('workerData', JSON.stringify(response.data.worker));
    return response.data;
  },

  updateWorkLocations: async (data) => {
    const response = await api.put('/workers/profile/work-locations', data);
    if (response.data.worker) localStorage.setItem('workerData', JSON.stringify(response.data.worker));
    return response.data;
  },

  updateDocuments: async (data) => {
    const response = await api.post('/workers/profile/documents', data);
    if (response.data.worker) localStorage.setItem('workerData', JSON.stringify(response.data.worker));
    return response.data;
  }
};

/**
 * Engineer Authentication Service
 */
export const engineerAuthService = {
  // Send OTP
  sendOTP: async (phone, email = null) => {
    const response = await api.post('/engineers/auth/send-otp', { phone, email });
    return response.data;
  },

  getRegistrationConfig: async () => {
    const response = await api.get('/forms/register-config?role=engineer');
    return response.data;
  },

  // Verify Login (Unified Flow)
  verifyLogin: async (data) => {
    const response = await api.post('/engineers/auth/verify-login', { ...data, role: 'engineer', platform: getPlatformType() });
    if (response.data.success && !response.data.isNewUser && response.data.accessToken) {
      localStorage.setItem('engineerAccessToken', response.data.accessToken);
      localStorage.setItem('engineerRefreshToken', response.data.refreshToken);
      localStorage.setItem('engineerData', JSON.stringify(response.data.engineer));
      notifyFlutterLogin(response.data);
      registerFCMToken('engineer', true).catch(console.error);
    }
    return response.data;
  },

  // Register
  register: async (data) => {
    const response = await api.post('/engineers/auth/register', { ...data, role: 'engineer', platform: getPlatformType() });
    if (response.data.accessToken) {
      localStorage.setItem('engineerAccessToken', response.data.accessToken);
      localStorage.setItem('engineerRefreshToken', response.data.refreshToken);
      localStorage.setItem('engineerData', JSON.stringify(response.data.engineer));
      notifyFlutterLogin(response.data);
    }
    return response.data;
  },

  // Login
  login: async (data) => {
    const { email, ...loginData } = data;
    const response = await api.post('/engineers/auth/login', loginData);
    if (response.data.accessToken) {
      localStorage.setItem('engineerAccessToken', response.data.accessToken);
      localStorage.setItem('engineerRefreshToken', response.data.refreshToken);
      localStorage.setItem('engineerData', JSON.stringify(response.data.engineer));
      notifyFlutterLogin(response.data);
      registerFCMToken('engineer', true).catch(console.error);
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    await removeFCMToken('engineer');
    try {
      await api.post('/engineers/auth/logout', { platform: getPlatformType() });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('engineerAccessToken');
    localStorage.removeItem('engineerRefreshToken');
    localStorage.removeItem('engineerData');
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/engineers/profile');
    if (response.data.engineer) {
      localStorage.setItem('engineerData', JSON.stringify(response.data.engineer));
    }
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/engineers/profile', data);
    if (response.data.engineer) {
      localStorage.setItem('engineerData', JSON.stringify(response.data.engineer));
    }
    return response.data;
  },

  getProfileCompletion: async () => {
    const response = await api.get('/engineers/profile/completion');
    return response.data;
  },

  updateBankDetails: async (data) => {
    const response = await api.put('/engineers/profile/bank-details', data);
    if (response.data.engineer) localStorage.setItem('engineerData', JSON.stringify(response.data.engineer));
    return response.data;
  },

  updateWorkLocations: async (data) => {
    const response = await api.put('/engineers/profile/work-locations', data);
    if (response.data.engineer) localStorage.setItem('engineerData', JSON.stringify(response.data.engineer));
    return response.data;
  },

  updateDocuments: async (data) => {
    const response = await api.post('/engineers/profile/documents', data);
    if (response.data.engineer) localStorage.setItem('engineerData', JSON.stringify(response.data.engineer));
    return response.data;
  }
};

/**
 * Admin Authentication Service
 */
export const adminAuthService = {
  // Login
  login: async (email, password, rememberMe = false) => {
    const response = await api.post('/admin/auth/login', { email, password });
    if (response.data.accessToken) {
      // Clear any session storage to prevent conflicts
      sessionStorage.removeItem('adminAccessToken');
      sessionStorage.removeItem('adminRefreshToken');
      sessionStorage.removeItem('adminData');

      // Always use localStorage for consistency
      localStorage.setItem('adminAccessToken', response.data.accessToken);
      localStorage.setItem('adminRefreshToken', response.data.refreshToken);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminData');
  }
};


