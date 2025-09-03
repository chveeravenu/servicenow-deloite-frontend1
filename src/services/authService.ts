import axios from 'axios';

const API_URL = 'https://sdb1.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials: { email: string; password: string }) => {
    return api.post('/auth/login', credentials);
  },

  signup: (userData: { name: string; email: string; password: string }) => {
    return api.post('/auth/signup', userData);
  },

  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },

  getCurrentUser: () => {
    return api.get('/auth/me');
  }
};