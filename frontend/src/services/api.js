import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile')
};

// Customer APIs
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getOne: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
};

// Account APIs
export const accountAPI = {
  create: (data) => api.post('/accounts', data),
  getAll: () => api.get('/accounts'),
  getOne: (accountNo) => api.get(`/accounts/${accountNo}`),
  update: (accountNo, data) => api.put(`/accounts/${accountNo}`, data),
  delete: (accountNo) => api.delete(`/accounts/${accountNo}`)
};

// Transaction APIs
export const transactionAPI = {
  deposit: (data) => api.post('/transactions/deposit', data),
  withdraw: (data) => api.post('/transactions/withdraw', data),
  transfer: (data) => api.post('/transactions/transfer', data),
  getHistory: (params) => api.get('/transactions/history', { params }),
  demonstrateSavepoint: () => api.post('/transactions/demo-savepoint')
};

// Audit APIs
export const auditAPI = {
  getAll: (params) => api.get('/audit', { params })
};

export default api;