import api from './api';

const flockService = {
  // Get all flocks
  getFlocks: async (params = {}) => {
    const response = await api.get('/flocks', { params });
    return response.data;
  },

  // Get single flock
  getFlock: async (id) => {
    const response = await api.get(`/flocks/${id}`);
    return response.data;
  },

  // Create flock
  createFlock: async (flockData) => {
    const response = await api.post('/flocks', flockData);
    return response.data;
  },

  // Update flock
  updateFlock: async (id, flockData) => {
    const response = await api.put(`/flocks/${id}`, flockData);
    return response.data;
  },

  // Delete flock
  deleteFlock: async (id) => {
    const response = await api.delete(`/flocks/${id}`);
    return response.data;
  },

  // Get flock statistics
  getFlockStats: async () => {
    const response = await api.get('/flocks/stats/summary');
    return response.data;
  }
};

export default flockService;

