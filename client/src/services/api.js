import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sessionToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sessionToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  getAuthUrl: () => api.get('/auth/google'),
  checkStatus: () => api.get('/auth/status'),
  logout: () => api.post('/auth/logout')
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  create: (name) => api.post('/projects', { name })
};

// Upload API
export const uploadAPI = {
  uploadFiles: (formData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  uploadTextNote: (data) => api.post('/upload/text-note', data),
  generateTitle: (data) => api.post('/upload/generate-title', data)
};

export default api;