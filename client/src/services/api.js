import axios from 'axios';

const API_URL = 'http://localhost:3002/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add the JWT token to the header
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
