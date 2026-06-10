import api from './api';

const adminEngineerService = {
  /**
   * Get all engineers with optional filters
   */
  getAllEngineers: async (params = {}) => {
    const response = await api.get('/admin/engineers', { params });
    return response.data;
  },

  /**
   * Get specific engineer details
   */
  getEngineerDetails: async (id) => {
    const response = await api.get(`/admin/engineers/${id}`);
    return response.data;
  },

  /**
   * Approve engineer registration
   */
  approveEngineer: async (id) => {
    const response = await api.post(`/admin/engineers/${id}/approve`);
    return response.data;
  },

  /**
   * Reject engineer registration
   */
  rejectEngineer: async (id, reason) => {
    const response = await api.post(`/admin/engineers/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Suspend engineer
   */
  suspendEngineer: async (id) => {
    const response = await api.post(`/admin/engineers/${id}/suspend`);
    return response.data;
  },

  /**
   * Toggle engineer active status
   */
  toggleStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/engineers/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Delete engineer
   */
  deleteEngineer: async (id) => {
    const response = await api.delete(`/admin/engineers/${id}`);
    return response.data;
  },

  /**
   * Get jobs for a specific engineer
   */
  getEngineerJobs: async (id, params = {}) => {
    const response = await api.get(`/admin/engineers/${id}/jobs`, { params });
    return response.data;
  },

  /**
   * Get all engineer jobs (across all engineers)
   */
  getAllJobs: async (params = {}) => {
    const response = await api.get('/admin/engineers/jobs', { params });
    return response.data;
  },

  /**
   * Get engineer earnings and payment history
   */
  getEngineerEarnings: async (id) => {
    const response = await api.get(`/admin/engineers/${id}/earnings`);
    return response.data;
  },

  /**
   * Record a payment to a engineer
   */
  payEngineer: async (id, paymentData) => {
    const response = await api.post(`/admin/engineers/${id}/pay`, paymentData);
    return response.data;
  },

  /**
   * Get engineer analytics/stats
   */
  getEngineerAnalytics: async (params = {}) => {
    const response = await api.get('/admin/reports/engineers', { params });
    return response.data;
  },

  /**
   * Get engineer payments summary
   */
  getEngineerPayments: async (params = {}) => {
    const response = await api.get('/admin/engineers/payments', { params });
    return response.data;
  }
};

export default adminEngineerService;
