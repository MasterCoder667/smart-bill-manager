import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests automatically - WITH DEBUGGING
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');
  
  console.log('🔐 [Frontend] API Request:', config.method?.toUpperCase(), config.url);
  console.log('🔐 [Frontend] Token from localStorage:', token);
  console.log('🔐 [Frontend] User ID from localStorage:', userId);
  
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 [Frontend] Authorization header set:', config.headers.Authorization);
  } else {
    console.log('❌ [Frontend] No valid token found in localStorage');
  }
  
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ [Frontend] API Response Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('❌ [Frontend] API Response Error:', error.response?.status, error.config?.url);
    console.log('❌ [Frontend] Error details:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔐 [Frontend] 401 Unauthorized - Clearing tokens');
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => {
    console.log('🔐 [Frontend] Login attempt for:', email);
    
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    return api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  
  register: (userData) => {
    console.log('🔐 [Frontend] Register attempt:', userData);
    return api.post('/register', userData);
  },
};

export const subscriptionsAPI = {
  getAll: () => {
    console.log('📖 [Frontend] Fetching all subscriptions');
    return api.get('/subscriptions/');
  },
  
  create: (subscriptionData) => {
    console.log('📝 [Frontend] Creating subscription:', subscriptionData);
    return api.post('/subscriptions/', subscriptionData);
  },
  
  update: (id, subscriptionData) => api.put(`/subscriptions/${id}`, subscriptionData),
  delete: (id) => api.delete(`/subscriptions/${id}`),
};

export default api;