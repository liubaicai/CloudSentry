import api from './api';

export interface FieldMapping {
  id: string;
  channelId?: string;
  sourceField: string;
  targetField: string;
  transformType: string;
  transformConfig?: any;
  enabled: boolean;
  priority: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  channel?: {
    id: string;
    name: string;
    sourceIdentifier: string;
  };
}

export interface CreateFieldMappingData {
  channelId?: string;
  sourceField: string;
  targetField: string;
  transformType?: string;
  transformConfig?: any;
  enabled?: boolean;
  priority?: number;
  description?: string;
}

export interface UpdateFieldMappingData {
  channelId?: string;
  sourceField?: string;
  targetField?: string;
  transformType?: string;
  transformConfig?: any;
  enabled?: boolean;
  priority?: number;
  description?: string;
}

const fieldMappingService = {
  async getFieldMappings(params?: { channelId?: string }) {
    const response = await api.get('/field-mappings', { params });
    return response.data;
  },

  async getFieldMapping(id: string) {
    const response = await api.get(`/field-mappings/${id}`);
    return response.data;
  },

  async createFieldMapping(data: CreateFieldMappingData) {
    const response = await api.post('/field-mappings', data);
    return response.data;
  },

  async updateFieldMapping(id: string, data: UpdateFieldMappingData) {
    const response = await api.patch(`/field-mappings/${id}`, data);
    return response.data;
  },

  async deleteFieldMapping(id: string) {
    const response = await api.delete(`/field-mappings/${id}`);
    return response.data;
  },
};

export default fieldMappingService;
