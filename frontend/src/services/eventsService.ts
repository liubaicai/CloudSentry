import api from './api';
import { SecurityEvent } from '../types';

interface EventsQuery {
  page?: number;
  limit?: number;
  severity?: string;
  category?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

interface EventsResponse {
  events: SecurityEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const eventsService = {
  async getEvents(query: EventsQuery = {}): Promise<EventsResponse> {
    const response = await api.get<EventsResponse>('/events', { params: query });
    return response.data;
  },

  async getEventById(id: string): Promise<SecurityEvent> {
    const response = await api.get<{ event: SecurityEvent }>(`/events/${id}`);
    return response.data.event;
  },

  async updateEvent(id: string, data: Partial<SecurityEvent>): Promise<SecurityEvent> {
    const response = await api.patch<{ event: SecurityEvent }>(`/events/${id}`, data);
    return response.data.event;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },
};
