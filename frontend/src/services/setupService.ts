import api from './api';
import { User } from '../types';

interface SetupStatusResponse {
  initialized: boolean;
}

interface SetupData {
  admin: {
    username: string;
    email: string;
    password: string;
  };
  settings?: {
    siteName?: string;
    syslogPort?: number;
    dataRetentionDays?: number;
  };
}

interface SetupResponse {
  token: string;
  user: User;
  message: string;
}

export const setupService = {
  async getStatus(): Promise<SetupStatusResponse> {
    const response = await api.get<SetupStatusResponse>('/setup/status');
    return response.data;
  },

  async completeSetup(data: SetupData): Promise<SetupResponse> {
    const response = await api.post<SetupResponse>('/setup/complete', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
};
