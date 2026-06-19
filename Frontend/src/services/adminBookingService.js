import api from './api';

export const adminBookingService = {
  // Get all bookings with filters and search
  getAllBookings: async (params) => {
    try {
      const response = await api.get('/admin/bookings', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch bookings' };
    }
  },

  // Get booking details by ID
  getBookingById: async (id) => {
    try {
      const response = await api.get(`/admin/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch booking details' };
    }
  },

  // Get booking analytics
  getAnalytics: async (filters = {}) => {
    try {
      const response = await api.get('/admin/bookings/analytics', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch analytics' };
    }
  },

  // Cancel booking
  cancelBooking: async (id, reason) => {
    try {
      const response = await api.patch(`/admin/bookings/${id}/cancel`, { cancellationReason: reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel booking' };
    }
  },

  // Auto assign provider
  autoAssignProvider: async (id) => {
    try {
      const response = await api.post(`/admin/bookings/${id}/auto-assign`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to auto-assign provider' };
    }
  },

  // Assign worker manually
  assignWorker: async (bookingId, workerId) => {
    try {
      const response = await api.patch(`/admin/bookings/${bookingId}/assign-worker`, { workerId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to assign worker' };
    }
  },

  // Reassign worker
  reassignWorker: async (bookingId, workerId) => {
    try {
      const response = await api.patch(`/admin/bookings/${bookingId}/reassign-worker`, { workerId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reassign worker' };
    }
  },

  // Update status
  updateStatus: async (bookingId, status) => {
    try {
      const response = await api.patch(`/admin/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update status' };
    }
  },

  // Add admin note
  addNote: async (bookingId, note) => {
    try {
      const response = await api.post(`/admin/bookings/${bookingId}/note`, { note });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add admin note' };
    }
  },

  // Get timeline
  getTimeline: async (bookingId) => {
    try {
      const response = await api.get(`/admin/bookings/${bookingId}/timeline`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch timeline' };
    }
  },

  // Get matching status
  getMatchingStatus: async (bookingId) => {
    try {
      const response = await api.get(`/admin/bookings/${bookingId}/matching`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch matching status' };
    }
  },

  // Get payment details
  getPayment: async (bookingId) => {
    try {
      const response = await api.get(`/admin/bookings/${bookingId}/payment`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payment' };
    }
  },

  // Payment action (refund, hold, release)
  paymentAction: async (bookingId, action) => {
    try {
      const response = await api.patch(`/admin/bookings/${bookingId}/payment-action`, { action });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to perform payment action' };
    }
  },

  // Get activity logs
  getLogs: async (bookingId) => {
    try {
      const response = await api.get(`/admin/bookings/${bookingId}/logs`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch activity logs' };
    }
  }
};
