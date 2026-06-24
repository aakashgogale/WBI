import api from './api';

export const userHomeService = {
  getHomeData: async (cityId) => {
    const query = cityId ? `?cityId=${cityId}` : '';
    const response = await api.get(`/user/home${query}`);
    return response.data;
  },
  
  searchServices: async (q) => {
    const response = await api.get(`/users/one-time-services/search?q=${encodeURIComponent(q)}`);
    return response.data;
  },
  
  getMostBooked: async () => {
    const response = await api.get(`/users/one-time-services/most-booked`);
    return response.data;
  }
};
