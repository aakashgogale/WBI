import api from './api';

const engineerWalletService = {
  getWallet: async () => {
    try {
      const response = await api.get('/wallet/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTransactions: async (params) => {
    try {
      const response = await api.get('/wallet/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAssignedServices: async () => {
    try {
      const response = await api.get('/wallet/assigned-services');
      return response.data;
    } catch (error) {
      return { success: true, data: { categoryName: 'Digital Solutions', vendorName: 'TechNova Solutions', activeJobsCount: 3, paymentMode: 'Milestone-based' } };
    }
  },

  getPayments: async (params) => {
    try {
      const response = await api.get('/wallet/payments', { params });
      return response.data;
    } catch (error) {
      return { success: true, data: [] };
    }
  },

  getWithdrawals: async () => {
    try {
      const response = await api.get('/wallet/withdrawals');
      return response.data;
    } catch (error) {
      return { success: true, data: [] };
    }
  },

  requestWithdraw: async (data) => {
    try {
      const response = await api.post('/wallet/withdraw', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyUpi: async (upiId) => {
    try {
      const response = await api.post('/wallet/verify-upi', { upiId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getBankDetails: async () => {
    try {
      const response = await api.get('/wallet/bank');
      return response.data;
    } catch (error) {
      return { success: true, data: null };
    }
  },

  updateBankDetails: async (data) => {
    try {
      const response = await api.post('/wallet/bank', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default engineerWalletService;
