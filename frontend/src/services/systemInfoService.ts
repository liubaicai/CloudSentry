import api from './api';
import { SystemInfo } from '../types';

export const systemInfoService = {
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await api.get<SystemInfo>('/system-info');
    return response.data;
  },
};
