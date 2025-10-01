import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/login', { username: email, password }),
  register: (userData) => api.post('/register/', userData),
};

export const subscriptionsAPI = {
  getAll: () => api.get('/subscriptions/'),
  create: (subscriptionData) => api.post('/subscriptions/', subscriptionData),
  update: (id, subscriptionData) => api.put(`/subscriptions/${id}`, subscriptionData),
  delete: (id) => api.delete(`/subscriptions/${id}`),
};

export default api;