import axios from 'axios';

const API_URL = 'https://sdb1.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } 
  return config;
});

export const courseService = {
  getAllCourses: () => {
    return api.get('/courses');
  },

  getCourseById: (id: number) => {
    return api.get(`/courses/${id}`);
  },

  enrollInCourse: (courseId: number) => {
    return api.post(`/courses/${courseId}/enroll`);
  },

  getCoursesByCategory: (category: string) => {
    return api.get(`/courses/category/${category}`);
  },

  searchCourses: (query: string) => {
    return api.get(`/courses/search?q=${query}`);
  }
};