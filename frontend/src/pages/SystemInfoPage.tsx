import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Spin, Typography, Tag, Button, Tooltip, message } from 'antd';
import {
  DesktopOutlined,
  ClockCircleOutlined,
  HddOutlined,
  CloudServerOutlined,
  ApiOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { systemInfoService } from '../services/systemInfoService';
import { SystemInfo } from '../types';

const { Title, Text } = Typography;

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  
  return parts.join(' ') || '不到1分钟';
};

const platformLabels: Record<string, string> = {
  linux: 'Linux',
  darwin: 'macOS',
  win32: 'Windows',
  freebsd: 'FreeBSD',
  sunos: 'SunOS',
  aix: 'AIX',
};

const archLabels: Record<string, string> = {
  x64: '64位 (x86_64)',
  arm64: '64位 (ARM64)',
  arm: 'ARM',
  ia32: '32位 (x86)',
};

export const SystemInfoPage: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSystemInfo = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await systemInfoService.getSystemInfo();
      setSystemInfo(data);
      setError(null);
    } catch {
      console.error('Failed to load system info');
      if (!isRefresh) {
        setError('无法加载系统信息');
      } else {
        message.error('刷新系统信息失败');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSystemInfo();
    
    // Auto-refresh every 10 seconds
    const interval = window.setInterval(() => {
      loadSystemInfo(true);
    }, 10000);
    
    return () => window.clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !systemInfo) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 16 }}>
        <Text style={{ color: '#ef4444', fontSize: 16 }}>{error || '无法加载系统信息'}</Text>
        <Button type="primary" onClick={() => loadSystemInfo()} icon={<ReloadOutlined />}>
          重新加载
        </Button>
      </div>
    );
  }

  const networkColumns = [
    {
      title: '接口名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: 'IP地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
    },
    {
      title: 'MAC地址',
      dataIndex: 'mac',
      key: 'mac',
      width: 180,
    },
    {
      title: '协议',
      dataIndex: 'family',
      key: 'family',
      width: 100,
      render: (family: string) => (
        <Tag color={family === 'IPv4' ? 'blue' : 'purple'}>{family}</Tag>
      ),
    },
  ];

  const getCpuStatusColor = (usage: number) => {
    if (usage < 50) return '#22c55e';
    if (usage < 80) return '#eab308';
    return '#ef4444';
  };

  const getMemoryStatusColor = (usage: number) => {
    if (usage < 60) return '#22c55e';
    if (usage < 85) return '#eab308';
    return '#ef4444';
  };

  return (
    <div style={{ padding: 16, width: '100%' }}>
      {/* Header */}
      <Card
        size="small"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
          border: '1px solid #334155',
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
                background: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CloudServerOutlined style={{ fontSize: 24, color: '#60A5FA' }} />
              </div>
              <div>
                <Title level={4} style={{ color: '#F8FAFC', margin: 0, fontWeight: 600 }}>系统信息监控</Title>
                <Text style={{ color: '#94A3B8' }}>实时监控系统配置、资源使用和运行状态</Text>
              </div>
            </div>
          </Col>
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Tag color="success" style={{ margin: 0, padding: '4px 12px', borderRadius: 4 }}>
                <CheckCircleOutlined /> 系统正常
              </Tag>
              <Tooltip title="刷新数据">
                <Button 
                  type="text" 
                  icon={<ReloadOutlined spin={refreshing} />} 
                  onClick={() => loadSystemInfo(true)}
                  style={{ color: '#94A3B8' }}
                />
              </Tooltip>
            </div>
          </Col>
        </Row>
      </Card>

      {/* System Overview Cards */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
            style={{ border: '1px solid #334155', borderRadius: 8, background: '#1E293B' }}
            bodyStyle={{ padding: 16 }}
          >
            <Statistic
              title={<span style={{ color: '#94A3B8', fontSize: 13 }}>操作系统</span>}
              value={platformLabels[systemInfo.os.platform] || systemInfo.os.platform}
              prefix={<DesktopOutlined style={{ color: '#60A5FA', background: '#334155', padding: 4, borderRadius: 4 }} />}
              valueStyle={{ color: '#F8FAFC', fontWeight: 600, marginTop: 4, fontSize: 18 }}
            />
            <Text style={{ color: '#64748B', fontSize: 12 }}>{systemInfo.os.release}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
            style={{ border: '1px solid #334155', borderRadius: 8, background: '#1E293B' }}
            bodyStyle={{ padding: 16 }}
          >
            <Statistic
              title={<span style={{ color: '#94A3B8', fontSize: 13 }}>主机名</span>}
              value={systemInfo.os.hostname}
              prefix={<ApiOutlined style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.2)', padding: 4, borderRadius: 4 }} />}
              valueStyle={{ color: '#F8FAFC', fontWeight: 600, marginTop: 4, fontSize: 18 }}
            />
            <Text style={{ color: '#64748B', fontSize: 12 }}>{archLabels[systemInfo.os.arch] || systemInfo.os.arch}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
            style={{ border: '1px solid #334155', borderRadius: 8, background: '#1E293B' }}
            bodyStyle={{ padding: 16 }}
          >
            <Statistic
              title={<span style={{ color: '#94A3B8', fontSize: 13 }}>系统运行时间</span>}
              value={formatUptime(systemInfo.uptime)}
              prefix={<ClockCircleOutlined style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.2)', padding: 4, borderRadius: 4 }} />}
              valueStyle={{ color: '#F8FAFC', fontWeight: 600, marginTop: 4, fontSize: 18 }}
            />
            <Text style={{ color: '#64748B', fontSize: 12 }}>自上次启动</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
            style={{ border: '1px solid #334155', borderRadius: 8, background: '#1E293B' }}
            bodyStyle={{ padding: 16 }}
          >
            <Statistic
              title={<span style={{ color: '#94A3B8', fontSize: 13 }}>CPU核心数</span>}
              value={systemInfo.cpu.cores}
              suffix="核"
              prefix={<HddOutlined style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.2)', padding: 4, borderRadius: 4 }} />}
              valueStyle={{ color: '#F8FAFC', fontWeight: 600, marginTop: 4, fontSize: 18 }}
            />
            <Text style={{ color: '#64748B', fontSize: 12 }}>{systemInfo.cpu.speed} MHz</Text>
          </Card>
        </Col>
      </Row>

      {/* CPU and Memory Usage */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                <HddOutlined style={{ color: '#60A5FA' }} />
                CPU 使用率
              </span>
            } 
            size="small"
            style={{ border: '1px solid #334155', borderRadius: 8, boxShadow: 'none', background: '#1E293B' }}
            headStyle={{ borderBottom: '1px solid #334155', minHeight: 40, color: '#F8FAFC' }}
            bodyStyle={{ padding: 24 }}
          >
            <Row gutter={24} align="middle">
              <Col span={8}>
                <Progress
                  type="dashboard"
                  percent={systemInfo.cpu.usage}
                  size={120}
                  strokeColor={getCpuStatusColor(systemInfo.cpu.usage)}
                  trailColor="#334155"
                  format={(percent) => (
                    <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 20 }}>{percent}%</span>
                  )}
                />
              </Col>
              <Col span={16}>
                <div style={{ marginBottom: 12 }}>
                  <Text style={{ color: '#94A3B8', fontSize: 12 }}>CPU型号</Text>
                  <div style={{ color: '#F8FAFC', fontSize: 14, marginTop: 4 }}>{systemInfo.cpu.model}</div>
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text style={{ color: '#94A3B8', fontSize: 12 }}>核心数量</Text>
                    <div style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 600 }}>{systemInfo.cpu.cores} 核</div>
                  </Col>
                  <Col span={12}>
                    <Text style={{ color: '#94A3B8', fontSize: 12 }}>主频</Text>
                    <div style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 600 }}>{systemInfo.cpu.speed} MHz</div>
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: '#94A3B8', fontSize: 12 }}>系统负载 (1/5/15分钟)</Text>
                  <div style={{ color: '#F8FAFC', fontSize: 14, marginTop: 4 }}>
                    {systemInfo.loadAverage.map(l => l.toFixed(2)).join(' / ')}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                <CloudServerOutlined style={{ color: '#22c55e' }} />
                内存使用率
              </span>
            } 
            size="small"
            style={{ border: '1px solid #334155', borderRadius: 8, boxShadow: 'none', background: '#1E293B' }}
            headStyle={{ borderBottom: '1px solid #334155', minHeight: 40, color: '#F8FAFC' }}
            bodyStyle={{ padding: 24 }}
          >
            <Row gutter={24} align="middle">
              <Col span={8}>
                <Progress
                  type="dashboard"
                  percent={systemInfo.memory.usagePercent}
                  size={120}
                  strokeColor={getMemoryStatusColor(systemInfo.memory.usagePercent)}
                  trailColor="#334155"
                  format={(percent) => (
                    <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 20 }}>{percent}%</span>
                  )}
                />
              </Col>
              <Col span={16}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text style={{ color: '#94A3B8', fontSize: 12 }}>总内存</Text>
                    <div style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 600 }}>{formatBytes(systemInfo.memory.total)}</div>
                  </Col>
                  <Col span={12}>
                    <Text style={{ color: '#94A3B8', fontSize: 12 }}>已使用</Text>
                    <div style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 600 }}>{formatBytes(systemInfo.memory.used)}</div>
                  </Col>
                  <Col span={12}>
                    <Text style={{ color: '#94A3B8', fontSize: 12 }}>可用内存</Text>
                    <div style={{ color: '#22c55e', fontSize: 16, fontWeight: 600 }}>{formatBytes(systemInfo.memory.free)}</div>
                  </Col>
                  <Col span={12}>
                    <Text style={{ color: '#94A3B8', fontSize: 12 }}>使用率</Text>
                    <div style={{ color: getMemoryStatusColor(systemInfo.memory.usagePercent), fontSize: 16, fontWeight: 600 }}>
                      {systemInfo.memory.usagePercent.toFixed(1)}%
                    </div>
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <Progress 
                    percent={systemInfo.memory.usagePercent} 
                    strokeColor={getMemoryStatusColor(systemInfo.memory.usagePercent)}
                    trailColor="#334155"
                    showInfo={false}
                    size="small"
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Network Interfaces */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                <ApiOutlined style={{ color: '#8b5cf6' }} />
                网络接口
              </span>
            } 
            size="small"
            style={{ border: '1px solid #334155', borderRadius: 8, boxShadow: 'none', background: '#1E293B' }}
            headStyle={{ borderBottom: '1px solid #334155', minHeight: 40, color: '#F8FAFC' }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              columns={networkColumns}
              dataSource={systemInfo.network}
              rowKey={(record) => `${record.name}-${record.address}`}
              pagination={false}
              size="small"
              bordered={false}
            />
          </Card>
        </Col>
      </Row>

      {/* System Details */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                <DesktopOutlined style={{ color: '#f59e0b' }} />
                系统详细信息
              </span>
            } 
            size="small"
            style={{ border: '1px solid #334155', borderRadius: 8, boxShadow: 'none', background: '#1E293B' }}
            headStyle={{ borderBottom: '1px solid #334155', minHeight: 40, color: '#F8FAFC' }}
            bodyStyle={{ padding: 16 }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>操作系统类型</Text>
                <div style={{ color: '#F8FAFC', fontSize: 14, marginTop: 4 }}>{systemInfo.os.type}</div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>平台</Text>
                <div style={{ color: '#F8FAFC', fontSize: 14, marginTop: 4 }}>
                  {platformLabels[systemInfo.os.platform] || systemInfo.os.platform}
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>内核版本</Text>
                <div style={{ color: '#F8FAFC', fontSize: 14, marginTop: 4 }}>{systemInfo.os.release}</div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>系统架构</Text>
                <div style={{ color: '#F8FAFC', fontSize: 14, marginTop: 4 }}>
                  {archLabels[systemInfo.os.arch] || systemInfo.os.arch}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Text style={{ color: '#64748B', fontSize: 12 }}>
          数据更新时间: {new Date(systemInfo.timestamp).toLocaleString('zh-CN')} | 每10秒自动刷新
        </Text>
      </div>
    </div>
  );
};
