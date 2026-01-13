import api from './api';

export interface SyslogChannel {
  id: string;
  name: string;
  sourceIdentifier: string;
  description?: string;
  enabled: boolean;
  eventCount: number;
  lastEventAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  _count?: {
    securityEvents: number;
    fieldMappings: number;
  };
}

export interface ChannelStats {
  totalChannels: number;
  activeChannels: number;
  totalEvents: number;
}

export interface CreateChannelData {
  name: string;
  sourceIdentifier: string;
  description?: string;
  enabled?: boolean;
  metadata?: any;
}

export interface UpdateChannelData {
  name?: string;
  sourceIdentifier?: string;
  description?: string;
  enabled?: boolean;
  metadata?: any;
}

export interface AIMappingSuggestion {
  sourceField: string;
  targetField: string;
  transformType: string;
  transformConfig?: any;
  description: string;
}

const channelService = {
  async getChannels(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const response = await api.get('/channels', { params });
    return response.data;
  },

  async getChannel(id: string) {
    const response = await api.get(`/channels/${id}`);
    return response.data;
  },

  async createChannel(data: CreateChannelData) {
    const response = await api.post('/channels', data);
    return response.data;
  },

  async updateChannel(id: string, data: UpdateChannelData) {
    const response = await api.patch(`/channels/${id}`, data);
    return response.data;
  },

  async deleteChannel(id: string) {
    const response = await api.delete(`/channels/${id}`);
    return response.data;
  },

  async getChannelStats() {
    const response = await api.get('/channels/stats');
    return response.data;
  },

  // AI Mapping Methods
  async generateAIMappings(channelId: string, sampleData: any): Promise<{
    message: string;
    mappings: AIMappingSuggestion[];
    isNew: boolean;
  }> {
    const response = await api.post(`/channels/${channelId}/ai-mappings/generate`, { sampleData });
    return response.data;
  },

  async applyAIMappings(channelId: string, mappings: AIMappingSuggestion[]): Promise<{
    message: string;
    count: number;
    mappings: any[];
  }> {
    const response = await api.post(`/channels/${channelId}/ai-mappings/apply`, { mappings });
    return response.data;
  },
};

export default channelService;
