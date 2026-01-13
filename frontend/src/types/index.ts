export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  source: string;
  destination?: string;
  message: string;
  rawLog: string;
  protocol?: string;
  port?: number;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  tags: string[];
  metadata?: any;
  channelId?: string;
  channel?: {
    id: string;
    name: string;
    sourceIdentifier: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AlertForwardingRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions: any;
  destination: string;
  type: 'webhook' | 'email' | 'syslog';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  overview: {
    total: number;
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
  severityDistribution: Array<{ severity: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  recentEvents: SecurityEvent[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
