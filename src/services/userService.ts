import axios from 'axios';

const API_URL = 'https://sdb1.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface UserData {
  name?: string;
  email?: string;
}

export const userService = {
  // Profile
  getUserProfile: () => api.get('/user/profile'),
  updateProfile: (userData: UserData) => api.put('/user/profile', userData),

  // Stats
  getUserStats: () => api.get('/user/stats'),

  // Courses
  getEnrolledCourses: () => api.get('/user/enrolled-courses'),
  enrollInCourse: (courseId: string) => api.post(`/user/enroll/${courseId}`),

  // Login history
  updateLoginHistory: () => api.post('/user/update-login-history'),

  // Learning time
  updateLearningTime: (payload: { minutesSpent: number }) =>
    api.post('/user/update-learning-time', payload),

  // Website usage
  updateWebsiteUsage: (payload: { minutesSpent: number }) =>
    api.post('/user/update-website-usage', payload),

  // Usage stats
  getUsageStats: () => api.get('/user/usage-stats'),
};