import api from './api';

export const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    // Update local storage user profile data
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...response.data?.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return response.data;
  },

  async getDashboard() {
    const response = await api.get('/users/dashboard');
    return response.data;
  },
};
