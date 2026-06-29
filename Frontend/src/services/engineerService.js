import api from './api';

const engineerService = {
  // Profile
  getProfile: async () => {
    const response = await api.get('/engineers/profile');
    if (response.data.success && response.data.engineer) {
      localStorage.setItem('engineerData', JSON.stringify(response.data.engineer));
    }
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/engineers/profile', profileData);
    if (response.data.success && response.data.engineer) {
      localStorage.setItem('engineerData', JSON.stringify(response.data.engineer));
    }
    return response.data;
  },

  uploadProfilePhoto: async (formData) => {
    const response = await api.post('/engineers/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.success && response.data.user) {
      const existingEngineer = JSON.parse(localStorage.getItem('engineerData') || '{}');
      localStorage.setItem('engineerData', JSON.stringify({ ...existingEngineer, profilePhoto: response.data.user.profilePhoto }));
    }
    return response.data;
  },

  updateSkillsProfile: async (payload) => {
    const response = await api.put('/engineers/profile/skills', payload);
    if (response.data.success && response.data.engineer) {
      localStorage.setItem('engineerData', JSON.stringify(response.data.engineer));
    }
    return response.data;
  },

  updateLocation: async (lat, lng) => {
    return api.put('/engineers/profile/location', { lat, lng });
  },

  getDashboardStats: async () => {
    const response = await api.get('/engineers/stats');
    return response.data;
  },

  // Jobs
  getAssignedJobs: async (params) => {
    const response = await api.get('/engineers/jobs', { params });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/engineers/jobs/${id}`);
    return response.data;
  },

  // --- Digital Solutions ---
  getDigitalJobs: async (params) => {
    const response = await api.get('/engineers/digital/jobs', { params });
    return response.data;
  },
  
  acceptDigitalJob: async (id) => {
    const response = await api.patch(`/engineers/digital/jobs/${id}/accept`);
    return response.data;
  },
  
  rejectDigitalJob: async (id) => {
    const response = await api.patch(`/engineers/digital/jobs/${id}/reject`);
    return response.data;
  },
  
  getDigitalProjects: async (params) => {
    const response = await api.get('/engineers/digital/projects', { params });
    return response.data;
  },

  updateJobStatus: async (id, status, data = {}) => {
    const response = await api.put(`/engineers/jobs/${id}/status`, { status, ...data });
    return response.data;
  },

  startJob: async (id) => {
    const response = await api.post(`/engineers/jobs/${id}/start`);
    return response.data;
  },

  workerReached: async (id) => { // keeping the function name the same as workerService if components expect it, but backend is /engineers
    const response = await api.post(`/engineers/jobs/${id}/reached`);
    return response.data;
  },

  completeJob: async (id, data = {}) => {
    const response = await api.post(`/engineers/jobs/${id}/complete`, data);
    return response.data;
  },

  verifyVisit: async (id, otp, location) => {
    const response = await api.post(`/engineers/jobs/${id}/visit/verify`, { otp, location });
    return response.data;
  },

  initiateCashCollection: async (id, totalAmount, extraItems = []) => {
    const response = await api.post(`/bookings/cash/${id}/initiate`, {
      totalAmount,
      extraItems
    });
    return response.data;
  },

  initiateOnlineCollection: async (id, totalAmount, extraItems = []) => {
    const response = await api.post(`/bookings/cash/${id}/initiate-online`, {
      totalAmount,
      extraItems
    });
    return response.data;
  },

  verifyOnlineCollection: async (id) => {
    const response = await api.post(`/bookings/cash/${id}/verify-online`);
    return response.data;
  },

  collectCash: async (id, otp, amount, extraItems = []) => {
    const response = await api.post(`/bookings/cash/${id}/confirm`, {
      otp,
      amount,
      extraItems
    });
    return response.data;
  },

  addJobNotes: async (id, data) => {
    const payload = typeof data === 'string' ? { notes: data } : data;
    const response = await api.post(`/engineers/jobs/${id}/notes`, payload);
    return response.data;
  },

  respondToJob: async (id, status) => {
    const response = await api.put(`/engineers/jobs/${id}/respond`, { status });
    return response.data;
  },

  uploadJobMedia: async (id, data) => {
    const response = await api.post(`/engineers/jobs/${id}/upload`, data);
    return response.data;
  },

  addJobMaterials: async (id, materials) => {
    const response = await api.post(`/engineers/jobs/${id}/materials`, { materials });
    return response.data;
  },

  getJobTimeline: async (id) => {
    const response = await api.get(`/engineers/jobs/${id}/timeline`);
    return response.data;
  },

  getJobProgress: async (id) => {
    const response = await api.get(`/engineers/jobs/${id}/progress`);
    return response.data;
  },

  addJobExpenses: async (id, expenses) => {
    const response = await api.post(`/engineers/jobs/${id}/expenses`, { expenses });
    return response.data;
  },

  getJobReport: async (id) => {
    const response = await api.get(`/engineers/jobs/${id}/report`);
    return response.data;
  },

  // Notifications
  getNotifications: async (params) => {
    const response = await api.get('/notifications/engineer', { params });
    return response.data;
  },

  markNotificationAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications/delete-all');
    return response.data;
  }
};

export default engineerService;
