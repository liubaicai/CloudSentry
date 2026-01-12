import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Input, Select, Button, Space, Modal, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { eventsService } from '../services/eventsService';
import { SecurityEvent } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;

const severityColors: Record<string, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'gold',
  low: 'blue',
  info: 'green',
};

const statusColors: Record<string, string> = {
  new: 'blue',
  investigating: 'orange',
  resolved: 'green',
  false_positive: 'gray',
};

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
    } catch (error) {
      message.error('Failed to load events');
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
      message.success('Event status updated');
      loadEvents();
    } catch (error) {
      message.error('Failed to update event');
    }
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: true,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => (
        <Tag color={severityColors[severity]}>{severity.toUpperCase()}</Tag>
      ),
      filters: [
        { text: 'Critical', value: 'critical' },
        { text: 'High', value: 'high' },
        { text: 'Medium', value: 'medium' },
        { text: 'Low', value: 'low' },
        { text: 'Info', value: 'info' },
      ],
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 150,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: SecurityEvent) => (
        <Select
          value={status}
          style={{ width: 120 }}
          size="small"
          onChange={(value) => handleUpdateStatus(record.id, value as SecurityEvent['status'])}
        >
          <Option value="new">New</Option>
          <Option value="investigating">Investigating</Option>
          <Option value="resolved">Resolved</Option>
          <Option value="false_positive">False Positive</Option>
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: SecurityEvent) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/threats/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedEvent(record);
              setDetailModalVisible(true);
            }}
          >
            Quick View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
          <Space wrap>
            <Input
              placeholder="Search events..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
            <Select
              placeholder="Severity"
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange('severity', value)}
              allowClear
            >
              <Option value="critical">Critical</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
              <Option value="info">Info</Option>
            </Select>
            <Select
              placeholder="Status"
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="new">New</Option>
              <Option value="investigating">Investigating</Option>
              <Option value="resolved">Resolved</Option>
              <Option value="false_positive">False Positive</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={loadEvents}>
              Refresh
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} events`,
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
        title="Event Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedEvent && (
          <div>
            <p><strong>ID:</strong> {selectedEvent.id}</p>
            <p><strong>Timestamp:</strong> {dayjs(selectedEvent.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p><strong>Severity:</strong> <Tag color={severityColors[selectedEvent.severity]}>{selectedEvent.severity.toUpperCase()}</Tag></p>
            <p><strong>Category:</strong> {selectedEvent.category}</p>
            <p><strong>Source:</strong> {selectedEvent.source}</p>
            {selectedEvent.destination && <p><strong>Destination:</strong> {selectedEvent.destination}</p>}
            {selectedEvent.protocol && <p><strong>Protocol:</strong> {selectedEvent.protocol}</p>}
            {selectedEvent.port && <p><strong>Port:</strong> {selectedEvent.port}</p>}
            <p><strong>Status:</strong> <Tag color={statusColors[selectedEvent.status]}>{selectedEvent.status}</Tag></p>
            <p><strong>Message:</strong> {selectedEvent.message}</p>
            <p><strong>Tags:</strong> {selectedEvent.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</p>
            <p><strong>Raw Log:</strong></p>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, overflow: 'auto', maxHeight: 300 }}>
              {selectedEvent.rawLog}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};
