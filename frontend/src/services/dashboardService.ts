import api from './api';
import { DashboardStats } from '../types';

interface TimeSeriesData {
  timeSeries: Array<{
    date: string;
    [key: string]: number | string;
  }>;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  async getTimeSeries(days: number = 7): Promise<TimeSeriesData> {
    const response = await api.get<TimeSeriesData>('/dashboard/timeseries', {
      params: { days },
    });
    return response.data;
  },
};
