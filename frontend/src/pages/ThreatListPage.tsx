import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Input, Select, Button, Space, Modal, message, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { eventsService } from '../services/eventsService';
import { SecurityEvent } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;

  const severityColors: Record<string, string> = {
    critical: 'error',
    high: 'warning',
    medium: 'gold',
    low: 'success',
    info: 'default',
  };

const severityLabels: Record<string, string> = {
  critical: '严重',
  high: '高危',
  medium: '中危',
  low: '低危',
  info: '信息',
};

const statusLabels: Record<string, string> = {
  new: '新建',
  investigating: '调查中',
  resolved: '已解决',
  false_positive: '误报',
};

  const statusColors: Record<string, string> = {
    new: 'default',
    investigating: 'warning',
    resolved: 'success',
    false_positive: 'default',
  };

const { Title, Text } = Typography;

export const ThreatListPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<any>({});
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsService.getEvents({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      });
      setEvents(response.events);
      setPagination({
        ...pagination,
        total: response.pagination.total,
      });
    } catch {
      message.error('加载事件失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleUpdateStatus = async (id: string, status: SecurityEvent['status']) => {
    try {
      await eventsService.updateEvent(id, { status });
      message.success('状态更新成功');
      loadEvents();
    } catch {
      message.error('状态更新失败');
    }
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: true,
    },
    {
      title: '级别',
      dataIndex: 'severity',
      key: 'severity',
      width: 80,
      render: (severity: string) => (
        <Tag color={severityColors[severity]}>{severityLabels[severity] || severity.toUpperCase()}</Tag>
      ),
      filters: [
        { text: '严重', value: 'critical' },
        { text: '高危', value: 'high' },
        { text: '中危', value: 'medium' },
        { text: '低危', value: 'low' },
        { text: '信息', value: 'info' },
      ],
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
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
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string, record: SecurityEvent) => (
        <Select
          value={status}
          style={{ width: 100 }}
          size="small"
          onChange={(value) => handleUpdateStatus(record.id, value as SecurityEvent['status'])}
        >
          <Option value="new">新建</Option>
          <Option value="investigating">调查中</Option>
          <Option value="resolved">已解决</Option>
          <Option value="false_positive">误报</Option>
        </Select>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 130,
      render: (_: any, record: SecurityEvent) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/threats/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedEvent(record);
              setDetailModalVisible(true);
            }}
          >
            快速查看
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 12 }}>
      {/* Header Banner */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 8,
        }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <WarningOutlined style={{ fontSize: 24, color: '#F59E0B' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>威胁管理</Title>
            <Text type="secondary">查看、筛选和管理安全事件</Text>
          </div>
        </div>
      </Card>

      <Card 
        size="small"
        style={{ 
          borderRadius: 8, 
        }}
      >
        <Space style={{ marginBottom: 12, width: '100%' }} direction="vertical">
          <Space wrap>
            <Input
              placeholder="搜索事件..."
              prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
              style={{ width: 250 }}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
            <Select
              placeholder="威胁级别"
              style={{ width: 100 }}
              onChange={(value) => handleFilterChange('severity', value)}
              allowClear
            >
              <Option value="critical">严重</Option>
              <Option value="high">高危</Option>
              <Option value="medium">中危</Option>
              <Option value="low">低危</Option>
              <Option value="info">信息</Option>
            </Select>
            <Select
              placeholder="状态"
              style={{ width: 100 }}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="new">新建</Option>
              <Option value="investigating">调查中</Option>
              <Option value="resolved">已解决</Option>
              <Option value="false_positive">误报</Option>
            </Select>
            <Button icon={<ReloadOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />} onClick={loadEvents}>
              刷新
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条事件`,
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current || 1,
              pageSize: newPagination.pageSize || 20,
              total: pagination.total,
            });
          }}
        />
      </Card>

      <Modal
        title="事件详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedEvent && (
          <div>
            <p><strong>ID:</strong> {selectedEvent.id}</p>
            <p><strong>时间:</strong> {dayjs(selectedEvent.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p><strong>级别:</strong> <Tag color={severityColors[selectedEvent.severity]}>{severityLabels[selectedEvent.severity] || selectedEvent.severity.toUpperCase()}</Tag></p>
            <p><strong>类别:</strong> {selectedEvent.category}</p>
            <p><strong>来源:</strong> {selectedEvent.source}</p>
            {selectedEvent.destination && <p><strong>目标:</strong> {selectedEvent.destination}</p>}
            {selectedEvent.protocol && <p><strong>协议:</strong> {selectedEvent.protocol}</p>}
            {selectedEvent.port && <p><strong>端口:</strong> {selectedEvent.port}</p>}
            <p><strong>状态:</strong> <Tag color={statusColors[selectedEvent.status]}>{statusLabels[selectedEvent.status] || selectedEvent.status}</Tag></p>
            <p><strong>消息:</strong> {selectedEvent.message}</p>
            <p><strong>标签:</strong> {selectedEvent.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</p>
            <p><strong>原始日志:</strong></p>
            <pre style={{ background: '#f5f5f5', border: '1px solid #d9d9d9', padding: 12, borderRadius: 4, overflow: 'auto', maxHeight: 300, color: 'rgba(0, 0, 0, 0.88)' }}>
              {selectedEvent.rawLog}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};
