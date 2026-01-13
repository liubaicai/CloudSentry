import api from './api';

export const configService = {
  // Network Configuration
  network: {
    async getAll() {
      const response = await api.get('/network');
      return response.data;
    },
    async getById(id: string) {
      const response = await api.get(`/network/${id}`);
      return response.data;
    },
    async create(data: any) {
      const response = await api.post('/network', data);
      return response.data;
    },
    async update(id: string, data: any) {
      const response = await api.patch(`/network/${id}`, data);
      return response.data;
    },
    async delete(id: string) {
      const response = await api.delete(`/network/${id}`);
      return response.data;
    },
  },

  // Operations Configuration
  operations: {
    async getAll(category?: string) {
      const response = await api.get('/operations', { params: { category } });
      return response.data;
    },
    async getById(id: string) {
      const response = await api.get(`/operations/${id}`);
      return response.data;
    },
    async create(data: any) {
      const response = await api.post('/operations', data);
      return response.data;
    },
    async update(id: string, data: any) {
      const response = await api.patch(`/operations/${id}`, data);
      return response.data;
    },
    async delete(id: string) {
      const response = await api.delete(`/operations/${id}`);
      return response.data;
    },
  },

  // Security Configuration
  security: {
    async getAll(category?: string) {
      const response = await api.get('/security-config', { params: { category } });
      return response.data;
    },
    async getById(id: string) {
      const response = await api.get(`/security-config/${id}`);
      return response.data;
    },
    async create(data: any) {
      const response = await api.post('/security-config', data);
      return response.data;
    },
    async update(id: string, data: any) {
      const response = await api.patch(`/security-config/${id}`, data);
      return response.data;
    },
    async delete(id: string) {
      const response = await api.delete(`/security-config/${id}`);
      return response.data;
    },
  },

  // Data Management
  dataManagement: {
    async getStats() {
      const response = await api.get('/data-management/stats');
      return response.data;
    },
    async deleteOldEvents(days: number) {
      const response = await api.post('/data-management/delete-old-events', { days });
      return response.data;
    },
    async exportEvents(params: any) {
      const response = await api.get('/data-management/export', { params });
      return response.data;
    },
    async getEventCount(startDate: string, endDate: string) {
      const response = await api.get('/data-management/count', {
        params: { startDate, endDate },
      });
      return response.data;
    },
    async createBackup() {
      const response = await api.post('/data-management/backup');
      return response.data;
    },
    async runMaintenance() {
      const response = await api.post('/data-management/maintenance');
      return response.data;
    },
  },
};
