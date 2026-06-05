import api from '../../../services/api';

/**
 * Admin Trust Video Service
 * Handles all admin trust video management API calls
 */

/**
 * Get all trust videos with filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Videos data  
 */
export const getAllTrustVideos = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
    if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await api.get(`/admin/trust-videos?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trust videos:', error);
    throw error;
  }
};

/**
 * Get trust video by ID
 * @param {string} id - Video ID
 * @returns {Promise<Object>} Video data
 */
export const getTrustVideoById = async (id) => {
  try {
    const response = await api.get(`/admin/trust-videos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trust video:', error);
    throw error;
  }
};

/**
 * Create new trust video
 * @param {Object} data - Video data
 * @returns {Promise<Object>} Created video
 */
export const createTrustVideo = async (data) => {
  try {
    const response = await api.post('/admin/trust-videos', data);
    return response.data;
  } catch (error) {
    console.error('Error creating trust video:', error);
    throw error;
  }
};

/**
 * Update trust video
 * @param {string} id - Video ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated video
 */
export const updateTrustVideo = async (id, data) => {
  try {
    const response = await api.put(`/admin/trust-videos/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating trust video:', error);
    throw error;
  }
};

/**
 * Delete trust video
 * @param {string} id - Video ID
 * @returns {Promise<Object>} Result
 */
export const deleteTrustVideo = async (id) => {
  try {
    const response = await api.delete(`/admin/trust-videos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting trust video:', error);
    throw error;
  }
};

/**
 * Toggle trust video status
 * @param {string} id - Video ID
 * @param {boolean} isActive - New status
 * @returns {Promise<Object>} Updated video
 */
export const toggleTrustVideoStatus = async (id, isActive) => {
  try {
    const response = await api.patch(`/admin/trust-videos/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Error toggling trust video status:', error);
    throw error;
  }
};

/**
 * Upload image/thumbnail via existing upload route
 * @param {File} file - File to upload
 * @param {string} type - 'thumbnail' or 'video'
 * @returns {Promise<Object>} Upload result with imageUrl
 */
export const uploadFile = async (file, type = 'thumbnail') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use /upload-media for videos, and original /upload for images
    const endpoint = type === 'video' ? '/admin/upload-media' : '/admin/upload';
    
    const response = await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export default {
  getAllTrustVideos,
  getTrustVideoById,
  createTrustVideo,
  updateTrustVideo,
  deleteTrustVideo,
  toggleTrustVideoStatus,
  uploadFile
};
