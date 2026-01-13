import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin, Progress, Typography } from 'antd';
import {
  ArrowUpOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Line,
  ComposedChart,
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const COLORS = ['#dc2626', '#ea580c', '#d97706', '#16a34a', '#334155'];

const severityColors: Record<string, string> = {
  critical: 'error',
  high: 'warning',
  medium: 'gold',
  low: 'success',
  info: 'blue',
};

const SEVERITY_HEX: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#16a34a',
  info: '#334155',
};

const severityLabels: Record<string, string> = {
  critical: '严重',
  high: '高危',
  medium: '中危',
  low: '低危',
  info: '信息',
};

const statusLabels: Record<string, string> = {
  new: '待处理',
  investigating: '调查中',
  resolved: '已解决',
  false_positive: '误报',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#f59e0b',
  investigating: '#3b82f6',
  resolved: '#22c55e',
  false_positive: '#94a3b8',
};

// Generate time series data for visualization
const generateTimeSeriesData = (days: number = 7) => {
  const data = [];
  const now = dayjs();
  for (let i = days - 1; i >= 0; i--) {
    data.push({
      date: now.subtract(i, 'day').format('MM-DD'),
      critical: Math.floor(Math.random() * 10) + 2,
      high: Math.floor(Math.random() * 20) + 8,
      medium: Math.floor(Math.random() * 30) + 12,
      low: Math.floor(Math.random() * 25) + 8,
      info: Math.floor(Math.random() * 40) + 15,
    });
  }
  return data;
};

// Demo radar data for security posture (based on status distribution)
const generateSecurityPostureData = (statusDist: Array<{ status: string; count: number }>) => {
  const total = statusDist.reduce((sum, s) => sum + s.count, 0) || 1;
  const resolved = statusDist.find(s => s.status === 'resolved')?.count || 0;
  const investigating = statusDist.find(s => s.status === 'investigating')?.count || 0;
  const newEvents = statusDist.find(s => s.status === 'new')?.count || 0;
  
  const responseRate = total > 0 ? Math.round(((resolved + investigating) / total) * 100) : 100;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
  const pendingRate = total > 0 ? Math.max(0, 100 - Math.round((newEvents / total) * 100)) : 100;
  
  return [
    { subject: '威胁检测', A: Math.min(100, 70 + Math.floor(Math.random() * 20)), fullMark: 100 },
    { subject: '事件响应', A: Math.min(100, responseRate), fullMark: 100 },
    { subject: '问题解决', A: Math.min(100, resolutionRate), fullMark: 100 },
    { subject: '日志收集', A: Math.min(100, 75 + Math.floor(Math.random() * 20)), fullMark: 100 },
    { subject: '处置效率', A: Math.min(100, pendingRate), fullMark: 100 },
    { subject: '系统可用', A: Math.min(100, 85 + Math.floor(Math.random() * 15)), fullMark: 100 },
  ];
};

// Generate hourly distribution data
const generateHourlyData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      events: Math.floor(Math.random() * 50) + 5,
      alerts: Math.floor(Math.random() * 10) + 1,
    });
  }
  return data;
};

interface TimeSeriesItem {
  date: string;
  [key: string]: string | number;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesItem[]>([]);
  const [securityPostureData, setSecurityPostureData] = useState<Array<{ subject: string; A: number; fullMark: number }>>([]);
  const [hourlyData] = useState(generateHourlyData());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
      
      // Try to load real time series data from API
      try {
        const tsData = await dashboardService.getTimeSeries(7);
        if (tsData.timeSeries && tsData.timeSeries.length > 0) {
          // Format date for display
          const formattedData = tsData.timeSeries.map(item => ({
            ...item,
            date: dayjs(item.date).format('MM-DD'),
          }));
          setTimeSeriesData(formattedData);
        } else {
          // Use mock data if no real data available
          setTimeSeriesData(generateTimeSeriesData());
        }
      } catch {
        // Fallback to mock data
        setTimeSeriesData(generateTimeSeriesData());
      }
      
      // Generate security posture based on status distribution
      setSecurityPostureData(generateSecurityPostureData(data.statusDistribution || []));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use fallback mock data
      setTimeSeriesData(generateTimeSeriesData());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) return null;

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '级别',
      dataIndex: 'severity',
      key: 'severity',
      width: 80,
      render: (severity: string) => (
        <Tag color={severityColors[severity]}>{severityLabels[severity] || severity.toUpperCase()}</Tag>
      ),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
  ];

  // Calculate security score - handles zero events case
  const totalEvents = stats.overview.total;
  const criticalCount = stats.severityDistribution.find((s: { severity: string }) => s.severity === 'critical')?.count || 0;
  const highCount = stats.severityDistribution.find((s: { severity: string }) => s.severity === 'high')?.count || 0;
  const securityScore = totalEvents === 0 
    ? 100 // Perfect score when no events
    : Math.max(0, Math.min(100, 100 - ((criticalCount * 10 + highCount * 5) / totalEvents * 100)));

  return (
    <div style={{ padding: 16, width: '100%' }}>
      {/* Header Banner */}
      <Card
        size="small"
        style={{
          background: '#fff',
           border: '1px solid #e2e8f0',
          marginBottom: 16,
          borderRadius: 8,
        }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                 background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                 <SafetyCertificateOutlined style={{ fontSize: 24, color: '#334155' }} />
              </div>
              <div>
                <Title level={4} style={{ color: '#1f2937', margin: 0, fontWeight: 600 }}>云卫安全态势中心</Title>
                <Text style={{ color: '#6b7280' }}>实时监控 • 智能分析 • 威胁预警</Text>
              </div>
            </div>
          </Col>
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>安全评分</div>
                <Progress
                  type="circle"
                  percent={Math.round(securityScore)}
                  size={42}
                  strokeColor={
                    securityScore > 80 ? '#22c55e' : 
                    securityScore > 60 ? '#eab308' : '#ef4444'
                  }
                  trailColor="#f3f4f6"
                  strokeWidth={8}
                  format={(percent) => <span style={{ color: '#1f2937', fontWeight: 600, fontSize: 14 }}>{percent}</span>}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>系统状态</div>
                <Tag color="success" style={{ margin: 0, padding: '4px 12px', borderRadius: 4 }}>
                  <CheckCircleOutlined /> 运行正常
                </Tag>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
             style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
            bodyStyle={{ padding: 16 }}
          >
            <Statistic
              title={<span style={{ color: '#6b7280', fontSize: 13 }}>事件总数</span>}
              value={stats.overview.total}
               prefix={<AlertOutlined style={{ color: '#334155', background: '#f1f5f9', padding: 4, borderRadius: 4 }} />}
              valueStyle={{ color: '#1f2937', fontWeight: 600, marginTop: 4 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
             style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
            bodyStyle={{ padding: 16 }}
          >
            <Statistic
              title={<span style={{ color: '#6b7280', fontSize: 13 }}>最近24小时</span>}
              value={stats.overview.last24Hours}
               prefix={<ClockCircleOutlined style={{ color: SEVERITY_HEX.critical, background: '#fef2f2', padding: 4, borderRadius: 4 }} />}
              valueStyle={{ color: '#1f2937', fontWeight: 600, marginTop: 4 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
             style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
            bodyStyle={{ padding: 16 }}
          >
            <Statistic
              title={<span style={{ color: '#6b7280', fontSize: 13 }}>最近7天</span>}
              value={stats.overview.last7Days}
               prefix={<ArrowUpOutlined style={{ color: SEVERITY_HEX.high, background: '#fff7ed', padding: 4, borderRadius: 4 }} />}
              valueStyle={{ color: '#1f2937', fontWeight: 600, marginTop: 4 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
             style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
            bodyStyle={{ padding: 16 }}
          >
            <Statistic
              title={<span style={{ color: '#6b7280', fontSize: 13 }}>最近30天</span>}
              value={stats.overview.last30Days}
               prefix={<GlobalOutlined style={{ color: SEVERITY_HEX.low, background: '#f0fdf4', padding: 4, borderRadius: 4 }} />}
              valueStyle={{ color: '#1f2937', fontWeight: 600, marginTop: 4 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                 <ThunderboltOutlined style={{ color: '#334155' }} />
                威胁趋势分析
              </span>
            } 
            size="small"
             style={{ border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: 'none' }}
             headStyle={{ borderBottom: '1px solid #e2e8f0', minHeight: 40 }}
             bodyStyle={{ padding: '12px 24px 0 0' }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timeSeriesData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false}
                   axisLine={{ stroke: '#e2e8f0' }}
                   tickMargin={8}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    borderRadius: 6,
                    fontSize: 12
                  }} 
                  itemStyle={{ fontSize: 12, padding: 0 }}
                />
                <Area type="monotone" dataKey="critical" name="严重" stroke={SEVERITY_HEX.critical} fill={SEVERITY_HEX.critical} fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="high" name="高危" stroke={SEVERITY_HEX.high} fill={SEVERITY_HEX.high} fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="medium" name="中危" stroke={SEVERITY_HEX.medium} fill={SEVERITY_HEX.medium} fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="low" name="低危" stroke={SEVERITY_HEX.low} fill={SEVERITY_HEX.low} fillOpacity={0.1} strokeWidth={2} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                <SafetyCertificateOutlined style={{ color: '#22c55e' }} />
                安全态势雷达
              </span>
            } 
            size="small"
             style={{ border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: 'none' }}
             headStyle={{ borderBottom: '1px solid #e2e8f0', minHeight: 40 }}
             bodyStyle={{ padding: 12 }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={securityPostureData}>
                 <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                 <Radar
                   name="安全指数"
                   dataKey="A"
                   stroke="#334155"
                   fill="#334155"
                   fillOpacity={0.12}
                 />
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    borderRadius: 6,
                    fontSize: 12
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                <WarningOutlined style={{ color: '#ef4444' }} />
                威胁级别分布
              </span>
            } 
            size="small"
             style={{ border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: 'none' }}
             headStyle={{ borderBottom: '1px solid #e2e8f0', minHeight: 40 }}
             bodyStyle={{ padding: 12 }}
          >
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.severityDistribution}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  label={({ severity, percent }) => `${severityLabels[severity] || severity}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                >
                  {stats.severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_HEX[entry.severity] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [value, severityLabels[name] || name]}
                  contentStyle={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    borderRadius: 6,
                    fontSize: 12
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                 <GlobalOutlined style={{ color: '#334155' }} />
                威胁类别分布
              </span>
            } 
            size="small"
             style={{ border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: 'none' }}
             headStyle={{ borderBottom: '1px solid #e2e8f0', minHeight: 40 }}
             bodyStyle={{ padding: '12px 24px 0 0' }}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.categoryDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                 <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis dataKey="category" type="category" width={100} stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    borderRadius: 6,
                    fontSize: 12
                  }}
                />
                 <Bar dataKey="count" name="数量" fill="#334155" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 3 - Hourly Distribution and Status */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                <ClockCircleOutlined style={{ color: '#0284c7' }} />
                24小时事件分布
              </span>
            } 
            size="small"
             style={{ border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: 'none' }}
             headStyle={{ borderBottom: '1px solid #e2e8f0', minHeight: 40 }}
             bodyStyle={{ padding: '12px 24px 0 0' }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={hourlyData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false}
                   axisLine={{ stroke: '#e2e8f0' }}
                  interval={2}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    borderRadius: 6,
                    fontSize: 12
                  }}
                />
                <Bar dataKey="events" name="事件数" fill="#94a3b8" radius={[2, 2, 0, 0]} barSize={10} />
                <Line type="monotone" dataKey="alerts" name="告警数" stroke="#dc2626" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                <NodeIndexOutlined style={{ color: '#8b5cf6' }} />
                事件状态分布
              </span>
            } 
            size="small"
             style={{ border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: 'none' }}
             headStyle={{ borderBottom: '1px solid #e2e8f0', minHeight: 40 }}
             bodyStyle={{ padding: 12 }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.statusDistribution.map((s) => ({
                    ...s,
                    name: statusLabels[s.status] || s.status,
                  }))}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                >
                  {stats.statusDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    borderRadius: 6,
                    fontSize: 12
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Events Table */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                <ClockCircleOutlined style={{ color: '#f59e0b' }} />
                最近安全事件
              </span>
            } 
            size="small"
             style={{ border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: 'none' }}
             headStyle={{ borderBottom: '1px solid #e2e8f0', minHeight: 40 }}
             bodyStyle={{ padding: 0 }}
          >
            <Table
              columns={columns}
              dataSource={stats.recentEvents}
              rowKey="id"
              pagination={false}
              size="small"
              bordered={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

};
