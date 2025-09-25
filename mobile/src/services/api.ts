import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - change this to your backend URL
// For development, use your computer's IP address instead of localhost
const API_BASE_URL = 'http://192.168.1.13:3000/api/v1'; // Update with your IP

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // TODO: Navigate to login screen
    }
    return Promise.reject(error);
  }
);

// Tree services
export const treeService = {
  async getAll(filters?: any) {
    const response = await api.get('/trees', { params: filters });
    return response.data;
  },
  
  async getById(id: string) {
    const response = await api.get(`/trees/${id}`);
    return response.data;
  },
  
  async create(treeData: any) {
    const response = await api.post('/trees', treeData);
    return response.data;
  },
  
  async update(id: string, treeData: any) {
    const response = await api.put(`/trees/${id}`, treeData);
    return response.data;
  },
  
  async delete(id: string) {
    const response = await api.delete(`/trees/${id}`);
    return response.data;
  },
  
  async getNearby(lat: number, lng: number, radius: number = 1000) {
    const response = await api.get('/trees/nearby', {
      params: { lat, lng, radius }
    });
    return response.data;
  },
  
  // NEW METHODS FOR MAP FUNCTIONALITY:
  
  async setLocation(id: string, latitude: number, longitude: number) {
    const response = await api.put(`/trees/${id}/location`, {
      latitude,
      longitude
    });
    return response.data;
  },
  
  async getInBounds(bounds: { north: number; south: number; east: number; west: number }) {
    const response = await api.get('/trees/bounds', {
      params: bounds
    });
    return response.data;
  },
  
  async getHighRisk(minRating: number = 70) {
    const response = await api.get('/trees/high-risk', {
      params: { min_rating: minRating }
    });
    return response.data;
  },
};

// Auth services
export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem('authToken', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },
  
  async register(userData: any) {
    const response = await api.post('/auth/register', userData);
    
    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem('authToken', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },
  
  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },
};

export default api;