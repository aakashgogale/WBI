import api from './api';

const sharedAuthService = {
  forgotPassword: async (role, identifier) => {
    const response = await api.post('/auth/forgot-password', { role, identifier });
    return response.data;
  },

  verifyResetOtp: async (role, identifier, otp) => {
    const response = await api.post('/auth/verify-reset-otp', { role, identifier, otp });
    return response.data;
  },

  resendResetOtp: async (role, identifier) => {
    const response = await api.post('/auth/resend-reset-otp', { role, identifier });
    return response.data;
  },

  resetPassword: async (role, identifier, resetToken, newPassword, confirmPassword) => {
    const response = await api.post('/auth/reset-password', { 
      role, 
      identifier, 
      resetToken, 
      newPassword, 
      confirmPassword 
    });
    return response.data;
  }
};

export default sharedAuthService;
