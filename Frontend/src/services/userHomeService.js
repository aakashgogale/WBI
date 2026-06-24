import api from './api';

export const userHomeService = {
  getHomeData: async (cityId) => {
    const cacheKey = `home_data_${cityId || 'default'}`;
    const cachedStr = sessionStorage.getItem(cacheKey);
    if (cachedStr) {
      try {
        const { data, timestamp } = JSON.parse(cachedStr);
        // 60-second TTL
        if (Date.now() - timestamp < 60000) {
          return data;
        }
      } catch (e) {
        // Cache invalid, proceed to fetch
      }
    }

    const query = cityId ? `?cityId=${cityId}` : '';
    const response = await api.get(`/user/home${query}`);
    
    // Save to cache
    sessionStorage.setItem(cacheKey, JSON.stringify({
      data: response.data,
      timestamp: Date.now()
    }));
    
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
