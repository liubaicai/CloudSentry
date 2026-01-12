import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const usersService = {
  async getUsers(params?: { page?: number; limit?: number; role?: string; search?: string }) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getUserById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data: { username: string; email: string; password: string; role?: string }) {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: { username?: string; email?: string; password?: string; role?: string }) {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
