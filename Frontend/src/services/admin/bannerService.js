import api from '../../api';

export const bannerService = {
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/banners?${queryParams}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/banners/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/admin/banners', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/admin/banners/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/banners/${id}`);
    return response.data;
  },

  updateOrder: async (items) => {
    const response = await api.patch('/admin/banners/order', { items });
    return response.data;
  }
};
