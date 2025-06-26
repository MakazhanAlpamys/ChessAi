import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    // Store token and user data in localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// User profile services
export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const updateUsername = async (username) => {
  try {
    const response = await api.put('/profile/username', { username });
    // Update user data in localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    userData.username = username;
    localStorage.setItem('user', JSON.stringify(userData));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put('/profile/password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const deleteAccount = async () => {
  try {
    const response = await api.delete('/profile');
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Lessons services
export const getLessons = async (searchTerm = '') => {
  try {
    const response = await api.get('/lessons');
    
    // If search term provided, filter lessons on client side
    if (searchTerm) {
      const filtered = response.data.filter(lesson => 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return filtered;
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const addLesson = async (lessonData) => {
  try {
    const response = await api.post('/lessons', lessonData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const deleteLesson = async (lessonId) => {
  try {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Games services
export const saveGame = async (gameData) => {
  try {
    const response = await api.post('/games', gameData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getGameHistory = async () => {
  try {
    const response = await api.get('/games/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching game history:', error);
    throw error;
  }
};

// Contact form service
export const sendContactMessage = async (messageData) => {
  try {
    const response = await api.post('/contact', messageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Admin services
export const getUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const updateUserAdmin = async (userId, isAdmin) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, { is_admin: isAdmin });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export default api; 