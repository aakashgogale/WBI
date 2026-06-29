import api from '../api';

export const adminHomeContentService = {
  // Publicly accessible GET route
  getSection: async (sectionKey) => {
    const response = await api.get(`/home-sections/${sectionKey}`);
    return response.data;
  },

  // Create section if not exists (POST)
  createSection: async (sectionKey, data) => {
    const response = await api.post(`/admin/home-sections/${sectionKey}`, data);
    return response.data;
  },

  // Update section by ID (PATCH)
  updateSection: async (sectionKey, id, data) => {
    const response = await api.patch(`/admin/home-sections/${sectionKey}/${id}`, data);
    return response.data;
  }
};
