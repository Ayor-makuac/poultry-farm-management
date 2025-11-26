import api from './api';
import flockService from './flockService';

// Auth Service
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  getLocalUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => !!localStorage.getItem('token')
};

// Production Service
export const productionService = {
  getProduction: async (params = {}) => {
    const response = await api.get('/production', { params });
    return response.data;
  },
  createProduction: async (data) => {
    const response = await api.post('/production', data);
    return response.data;
  },
  updateProduction: async (id, data) => {
    const response = await api.put(`/production/${id}`, data);
    return response.data;
  },
  deleteProduction: async (id) => {
    const response = await api.delete(`/production/${id}`);
    return response.data;
  },
  getProductionStats: async (params = {}) => {
    const response = await api.get('/production/stats/summary', { params });
    return response.data;
  }
};

// Feeding Service
export const feedingService = {
  getFeeding: async (params = {}) => {
    const response = await api.get('/feeding', { params });
    return response.data;
  },
  createFeeding: async (data) => {
    const response = await api.post('/feeding', data);
    return response.data;
  },
  updateFeeding: async (id, data) => {
    const response = await api.put(`/feeding/${id}`, data);
    return response.data;
  },
  deleteFeeding: async (id) => {
    const response = await api.delete(`/feeding/${id}`);
    return response.data;
  }
};

// Health Service
export const healthService = {
  getHealth: async (params = {}) => {
    const response = await api.get('/health', { params });
    return response.data;
  },
  createHealth: async (data) => {
    const response = await api.post('/health', data);
    return response.data;
  },
  updateHealth: async (id, data) => {
    const response = await api.put(`/health/${id}`, data);
    return response.data;
  },
  deleteHealth: async (id) => {
    const response = await api.delete(`/health/${id}`);
    return response.data;
  },
  getHealthAlerts: async () => {
    const response = await api.get('/health/alerts/active');
    return response.data;
  }
};

// Inventory Service
export const inventoryService = {
  getInventory: async (params = {}) => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },
  createInventory: async (data) => {
    const response = await api.post('/inventory', data);
    return response.data;
  },
  updateInventory: async (id, data) => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },
  deleteInventory: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },
  getLowStockAlerts: async () => {
    const response = await api.get('/inventory/alerts/low-stock');
    return response.data;
  }
};

// Sales Service
export const salesService = {
  getSales: async (params = {}) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },
  createSale: async (data) => {
    const response = await api.post('/sales', data);
    return response.data;
  },
  updateSale: async (id, data) => {
    const response = await api.put(`/sales/${id}`, data);
    return response.data;
  },
  deleteSale: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },
  getSalesStats: async (params = {}) => {
    const response = await api.get('/sales/stats/summary', { params });
    return response.data;
  }
};

// Expense Service
export const expenseService = {
  getExpenses: async (params = {}) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },
  createExpense: async (data) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },
  updateExpense: async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },
  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
  getExpenseStats: async (params = {}) => {
    const response = await api.get('/expenses/stats/summary', { params });
    return response.data;
  }
};

// Report Service
export const reportService = {
  getProductionReport: async (params = {}) => {
    const response = await api.get('/reports/production', { params });
    return response.data;
  },
  getFinancialReport: async (params = {}) => {
    const response = await api.get('/reports/financial', { params });
    return response.data;
  },
  getPerformanceMetrics: async (params = {}) => {
    const response = await api.get('/reports/performance', { params });
    return response.data;
  },
  getInventoryReport: async (params = {}) => {
    const response = await api.get('/reports/inventory', { params });
    return response.data;
  }
};

// Notification Service
export const notificationService = {
  getUserNotifications: async (userId) => {
    const response = await api.get(`/notifications/user/${userId}`);
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async (userId) => {
    const response = await api.put(`/notifications/user/${userId}/read-all`);
    return response.data;
  },
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};

// User Service
export { default as userService } from './userService';

// Export flockService
export { flockService };

export default api;

