import api from './api';

const verificationService = {
  // Client (Worker/Engineer) Methods
  getMyStatus: async () => {
    const response = await api.get('/verification/my-status');
    return response.data;
  },

  uploadDocument: async (file, documentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    const response = await api.post('/verification/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  verifyAadhaar: async (aadhaarNumber) => {
    const response = await api.post('/verification/aadhaar/verify', { aadhaarNumber });
    return response.data;
  },

  verifyPan: async (panNumber, fullName, dob) => {
    const response = await api.post('/verification/pan/verify', { panNumber, fullName, dob });
    return response.data;
  },

  verifyBankDetails: async (accountNumber, ifsc, accountHolderName) => {
    const response = await api.post('/verification/bank/verify', { accountNumber, ifsc, accountHolderName });
    return response.data;
  },

  verifySelfieMatch: async () => {
    const response = await api.post('/verification/selfie/verify');
    return response.data;
  },

  submitRequest: async () => {
    const response = await api.post('/verification/submit');
    return response.data;
  },

  // Admin Methods
  getVerifications: async (params) => {
    const response = await api.get('/admin/verifications', { params });
    return response.data;
  },

  getVerificationDetail: async (id) => {
    const response = await api.get(`/admin/verifications/${id}`);
    return response.data;
  },

  approveDocument: async (id, documentType) => {
    const response = await api.patch(`/admin/verifications/${id}/approve`, { documentType });
    return response.data;
  },

  rejectDocument: async (id, documentType, reason) => {
    const response = await api.patch(`/admin/verifications/${id}/reject`, { documentType, reason });
    return response.data;
  },

  requestReupload: async (id, documentType, reason) => {
    const response = await api.patch(`/admin/verifications/${id}/request-reupload`, { documentType, reason });
    return response.data;
  },

  getVerificationConfig: async (roleType) => {
    const response = await api.get('/admin/verification-config', { params: { roleType } });
    return response.data;
  },

  updateVerificationConfig: async (configData) => {
    const response = await api.put('/admin/verification-config', configData);
    return response.data;
  },

  getVerificationLogs: async (params) => {
    const response = await api.get('/admin/verification-logs', { params });
    return response.data;
  }
};

export default verificationService;
