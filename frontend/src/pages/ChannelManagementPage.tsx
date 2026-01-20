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
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import channelService, { SyslogChannel, CreateChannelData } from '../services/channelService';

const { Title, Text } = Typography;

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
    } catch {
      message.error('加载通道失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await channelService.getChannelStats();
      setStats(stats);
    } catch {
      // ignore
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
      message.success('通道删除成功');
      fetchChannels();
      fetchStats();
    } catch {
      message.error('通道删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingChannel) {
        await channelService.updateChannel(editingChannel.id, values);
        message.success('通道更新成功');
      } else {
        await channelService.createChannel(values as CreateChannelData);
        message.success('通道创建成功');
      }
      setModalVisible(false);
      fetchChannels();
      fetchStats();
    } catch {
      message.error('保存通道失败');
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
      title: '通道名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
    },
    {
      title: '来源标识',
      dataIndex: 'sourceIdentifier',
      key: 'sourceIdentifier',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '事件数',
      dataIndex: 'eventCount',
      key: 'eventCount',
      width: 100,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '最后事件',
      dataIndex: 'lastEventAt',
      key: 'lastEventAt',
      width: 160,
      render: (date: string) =>
        date ? new Date(date).toLocaleString() : '从未',
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除此通道吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
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
            background: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <GlobalOutlined style={{ fontSize: 24, color: '#8B5CF6' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>通道管理</Title>
            <Text type="secondary">管理Syslog日志接收通道</Text>
          </div>
        </div>
      </Card>

      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="通道总数"
              value={stats.totalChannels}
              valueStyle={{ color: '#60A5FA', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="活跃通道"
              value={stats.activeChannels}
              valueStyle={{ color: '#22C55E', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="接收事件总数"
              value={stats.totalEvents}
              valueStyle={{ color: '#8B5CF6', fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        style={{ 
          borderRadius: 8, 
        }}
        extra={
          <Space>
            <Input.Search
              placeholder="搜索通道..."
              allowClear
              style={{ width: 200 }}
              onSearch={setSearchText}
              size="small"
            />
            <Button
              icon={<ReloadOutlined />}
              size="small"
              onClick={() => {
                fetchChannels();
                fetchStats();
              }}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={handleCreate}
            >
              添加通道
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
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingChannel ? '编辑通道' : '创建通道'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="通道名称"
            rules={[{ required: true, message: '请输入通道名称' }]}
          >
            <Input placeholder="例如：防火墙服务器" />
          </Form.Item>
          <Form.Item
            name="sourceIdentifier"
            label="来源标识"
            rules={[
              { required: true, message: '请输入来源标识' },
            ]}
            help="用于唯一标识发送方的IP地址或主机名"
          >
            <Input placeholder="例如：192.168.1.100 或 firewall.local" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea
              rows={3}
              placeholder="此通道的可选描述"
            />
          </Form.Item>
          <Form.Item
            name="enabled"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChannelManagementPage;
