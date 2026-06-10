import api from './api';

const engineerWalletService = {
  getWallet: async () => {
    try {
      const response = await api.get('/engineers/wallet');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTransactions: async (params) => {
    try {
      const response = await api.get('/engineers/wallet/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  requestPayout: async (bookingId) => {
    try {
      const response = await api.post('/engineers/wallet/request-payout', { bookingId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  requestWithdraw: async (data) => {
    try {
      const response = await api.post('/engineers/wallet/withdraw', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default engineerWalletService;
