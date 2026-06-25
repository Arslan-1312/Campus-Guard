import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusguard_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('campusguard_token');
      localStorage.removeItem('campusguard_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getEvidenceUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('cloudinary.com')) return url;
    const uploadsIndex = url.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      const relativePath = url.substring(uploadsIndex);
      const apiURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const origin = apiURL.replace(/\/api\/?$/, '');
      return `${origin}${relativePath}`;
    }
    return url;
  }
  const apiURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const origin = apiURL.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default api;

