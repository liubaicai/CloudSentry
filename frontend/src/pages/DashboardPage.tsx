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
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const COLORS = ['#ff4d4f', '#ff7a45', '#ffa940', '#52c41a', '#1890ff'];

const severityColors: Record<string, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'gold',
  low: 'blue',
  info: 'green',
};

const severityLabels: Record<string, string> = {
  critical: '严重',
  high: '高危',
  medium: '中危',
  low: '低危',
  info: '信息',
};

// Demo time series data for the area chart
const generateTimeSeriesData = () => {
  const data = [];
  const now = dayjs();
  for (let i = 6; i >= 0; i--) {
    data.push({
      date: now.subtract(i, 'day').format('MM-DD'),
      critical: Math.floor(Math.random() * 10) + 5,
      high: Math.floor(Math.random() * 20) + 10,
      medium: Math.floor(Math.random() * 30) + 15,
      low: Math.floor(Math.random() * 25) + 10,
      info: Math.floor(Math.random() * 40) + 20,
    });
  }
  return data;
};

// Demo radar data for security posture
const securityPostureData = [
  { subject: '防火墙', A: 85, fullMark: 100 },
  { subject: '入侵检测', A: 75, fullMark: 100 },
  { subject: '漏洞扫描', A: 90, fullMark: 100 },
  { subject: '日志审计', A: 80, fullMark: 100 },
  { subject: '终端安全', A: 70, fullMark: 100 },
  { subject: '访问控制', A: 88, fullMark: 100 },
];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSeriesData] = useState(generateTimeSeriesData());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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

  // Calculate security score
  const totalEvents = stats.overview.total || 1;
  const criticalCount = stats.severityDistribution.find(s => s.severity === 'critical')?.count || 0;
  const highCount = stats.severityDistribution.find(s => s.severity === 'high')?.count || 0;
  const securityScore = Math.max(0, 100 - ((criticalCount * 10 + highCount * 5) / totalEvents * 100));

  return (
    <div style={{ padding: 12 }}>
      {/* Header Banner */}
      <Card
        size="small"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: 'none',
          marginBottom: 12,
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <SafetyCertificateOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
              <div>
                <Title level={4} style={{ color: 'white', margin: 0 }}>云哨安全态势中心</Title>
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>实时监控 • 智能分析 • 威胁预警</Text>
              </div>
            </div>
          </Col>
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>安全评分</div>
                <Progress
                  type="circle"
                  percent={Math.round(securityScore)}
                  size={56}
                  strokeColor={{
                    '0%': '#52c41a',
                    '100%': '#87d068',
                  }}
                  format={(percent) => <span style={{ color: 'white', fontWeight: 'bold' }}>{percent}</span>}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>系统状态</div>
                <Tag color="green" style={{ marginTop: 4 }}>
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
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>事件总数</span>}
              value={stats.overview.total}
              prefix={<AlertOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>最近24小时</span>}
              value={stats.overview.last24Hours}
              prefix={<ClockCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>最近7天</span>}
              value={stats.overview.last7Days}
              prefix={<ArrowUpOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
            style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>最近30天</span>}
              value={stats.overview.last30Days}
              prefix={<GlobalOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ThunderboltOutlined style={{ color: '#1890ff' }} />
                威胁趋势分析
              </span>
            } 
            size="small"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7a45" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff7a45" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffa940" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ffa940" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#8c8c8c" fontSize={12} />
                <YAxis stroke="#8c8c8c" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(255,255,255,0.95)', 
                    border: 'none', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    borderRadius: 4,
                  }} 
                />
                <Area type="monotone" dataKey="critical" name="严重" stroke="#ff4d4f" fillOpacity={1} fill="url(#colorCritical)" />
                <Area type="monotone" dataKey="high" name="高危" stroke="#ff7a45" fillOpacity={1} fill="url(#colorHigh)" />
                <Area type="monotone" dataKey="medium" name="中危" stroke="#ffa940" fillOpacity={1} fill="url(#colorMedium)" />
                <Area type="monotone" dataKey="low" name="低危" stroke="#52c41a" fillOpacity={1} fill="url(#colorLow)" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                安全态势雷达
              </span>
            } 
            size="small"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={securityPostureData}>
                <PolarGrid stroke="#e8e8e8" />
                <PolarAngleAxis dataKey="subject" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                <Radar
                  name="安全指数"
                  dataKey="A"
                  stroke="#1890ff"
                  fill="#1890ff"
                  fillOpacity={0.4}
                />
                <Tooltip />
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
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                威胁级别分布
              </span>
            } 
            size="small"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1}/>
                      <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={stats.severityDistribution}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  label={({ severity, percent }) => `${severityLabels[severity] || severity}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#8c8c8c' }}
                >
                  {stats.severityDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index % COLORS.length})`} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [value, severityLabels[name] || name]}
                  contentStyle={{ borderRadius: 4 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GlobalOutlined style={{ color: '#1890ff' }} />
                威胁类别分布
              </span>
            } 
            size="small"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.categoryDistribution} layout="vertical">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#667eea" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#764ba2" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#8c8c8c" fontSize={12} />
                <YAxis dataKey="category" type="category" width={80} stroke="#8c8c8c" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 4 }} />
                <Bar dataKey="count" name="数量" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Events Table */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#faad14' }} />
                最近安全事件
              </span>
            } 
            size="small"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <Table
              columns={columns}
              dataSource={stats.recentEvents}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
