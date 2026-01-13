import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import channelService, { SyslogChannel, CreateChannelData } from '../services/channelService';

const ChannelManagementPage: React.FC = () => {
  const [channels, setChannels] = useState<SyslogChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [stats, setStats] = useState({
    totalChannels: 0,
    activeChannels: 0,
    totalEvents: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingChannel, setEditingChannel] = useState<SyslogChannel | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchChannels();
    fetchStats();
  }, [pagination.current, pagination.pageSize, searchText]);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const response = await channelService.getChannels({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
      });
      setChannels(response.channels);
      setPagination({
        ...pagination,
        total: response.pagination.total,
      });
    } catch (error) {
      message.error('Failed to fetch channels');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await channelService.getChannelStats();
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreate = () => {
    setEditingChannel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (channel: SyslogChannel) => {
    setEditingChannel(channel);
    form.setFieldsValue(channel);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await channelService.deleteChannel(id);
      message.success('Channel deleted successfully');
      fetchChannels();
      fetchStats();
    } catch (error) {
      message.error('Failed to delete channel');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingChannel) {
        await channelService.updateChannel(editingChannel.id, values);
        message.success('Channel updated successfully');
      } else {
        await channelService.createChannel(values as CreateChannelData);
        message.success('Channel created successfully');
      }
      setModalVisible(false);
      fetchChannels();
      fetchStats();
    } catch (error) {
      message.error('Failed to save channel');
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const columns: ColumnsType<SyslogChannel> = [
    {
      title: 'Channel Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Source Identifier',
      dataIndex: 'sourceIdentifier',
      key: 'sourceIdentifier',
      width: 180,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? 'Enabled' : 'Disabled'}
        </Tag>
      ),
    },
    {
      title: 'Event Count',
      dataIndex: 'eventCount',
      key: 'eventCount',
      width: 120,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: 'Last Event',
      dataIndex: 'lastEventAt',
      key: 'lastEventAt',
      width: 180,
      render: (date: string) =>
        date ? new Date(date).toLocaleString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this channel?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Channels"
              value={stats.totalChannels}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Channels"
              value={stats.activeChannels}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Events Received"
              value={stats.totalEvents}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Channel Management"
        extra={
          <Space>
            <Input.Search
              placeholder="Search channels..."
              allowClear
              style={{ width: 250 }}
              onSearch={setSearchText}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchChannels();
                fetchStats();
              }}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add Channel
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={channels}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingChannel ? 'Edit Channel' : 'Create Channel'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Channel Name"
            rules={[{ required: true, message: 'Please enter channel name' }]}
          >
            <Input placeholder="e.g., Firewall Server" />
          </Form.Item>
          <Form.Item
            name="sourceIdentifier"
            label="Source Identifier"
            rules={[
              { required: true, message: 'Please enter source identifier' },
            ]}
            help="IP address or hostname that uniquely identifies the sender"
          >
            <Input placeholder="e.g., 192.168.1.100 or firewall.local" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Optional description of this channel"
            />
          </Form.Item>
          <Form.Item
            name="enabled"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChannelManagementPage;
