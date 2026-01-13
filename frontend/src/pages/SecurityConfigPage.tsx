import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, Switch, message, Select, Row, Col, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined, LockOutlined, ClockCircleOutlined, KeyOutlined } from '@ant-design/icons';
import { configService } from '../services/configService';

const { Title, Text } = Typography;

const categoryLabels: Record<string, string> = {
  authentication: '身份认证',
  encryption: '加密',
  access_control: '访问控制',
  password_policy: '密码策略',
  session: '会话管理',
  audit: '审计日志',
};

const categoryIcons: Record<string, React.ReactNode> = {
  authentication: <LockOutlined />,
  encryption: <KeyOutlined />,
  access_control: <SafetyOutlined />,
  password_policy: <KeyOutlined />,
  session: <ClockCircleOutlined />,
  audit: <SafetyOutlined />,
};

// Predefined security config templates
const securityTemplates = [
  {
    category: 'password_policy',
    key: 'min_length',
    value: { minLength: 8 },
    description: '密码最小长度要求',
  },
  {
    category: 'password_policy',
    key: 'complexity',
    value: { requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecial: true },
    description: '密码复杂度要求',
  },
  {
    category: 'password_policy',
    key: 'expiration',
    value: { days: 90, warnBefore: 14 },
    description: '密码过期时间（天）',
  },
  {
    category: 'password_policy',
    key: 'history',
    value: { count: 5 },
    description: '禁止重复使用最近N次密码',
  },
  {
    category: 'session',
    key: 'timeout',
    value: { minutes: 30, idleTimeout: 15 },
    description: '会话超时时间',
  },
  {
    category: 'session',
    key: 'concurrent',
    value: { maxSessions: 3 },
    description: '最大并发会话数',
  },
  {
    category: 'authentication',
    key: 'login_attempts',
    value: { maxAttempts: 5, lockoutMinutes: 15 },
    description: '登录失败锁定策略',
  },
  {
    category: 'authentication',
    key: 'two_factor',
    value: { enabled: false, methods: ['totp', 'email'] },
    description: '双因素认证配置',
  },
  {
    category: 'access_control',
    key: 'ip_whitelist',
    value: { enabled: false, ips: [] },
    description: 'IP白名单配置',
  },
  {
    category: 'audit',
    key: 'log_retention',
    value: { days: 365 },
    description: '审计日志保留期限',
  },
];

export const SecurityConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadConfigs();
  }, [filterCategory]);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await configService.security.getAll(filterCategory || undefined);
      setConfigs(data);
    } catch (error) {
      message.error('加载安全配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({ enabled: true, value: {} });
    setModalVisible(true);
  };

  const handleCreateFromTemplate = async (template: typeof securityTemplates[0]) => {
    try {
      await configService.security.create({
        ...template,
        enabled: true,
      });
      message.success('安全配置创建成功');
      loadConfigs();
    } catch (error: any) {
      if (error.response?.data?.error?.includes('Unique constraint')) {
        message.warning('该配置已存在');
      } else {
        message.error('配置创建失败');
      }
    }
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    form.setFieldsValue({
      ...config,
      value: typeof config.value === 'object' ? JSON.stringify(config.value, null, 2) : config.value,
    });
    setModalVisible(true);
  };

  const handleDelete = (config: any) => {
    Modal.confirm({
      title: '删除安全配置',
      content: `确定要删除 "${categoryLabels[config.category] || config.category}.${config.key}" 吗？`,
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await configService.security.delete(config.id);
          message.success('安全配置删除成功');
          loadConfigs();
        } catch (error) {
          message.error('配置删除失败');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      // Parse JSON value
      let parsedValue = values.value;
      if (typeof values.value === 'string') {
        try {
          parsedValue = JSON.parse(values.value);
        } catch (e) {
          parsedValue = values.value;
        }
      }

      const data = { ...values, value: parsedValue };

      if (editingConfig) {
        await configService.security.update(editingConfig.id, data);
        message.success('安全配置更新成功');
      } else {
        await configService.security.create(data);
        message.success('安全配置创建成功');
      }
      setModalVisible(false);
      loadConfigs();
    } catch (error: any) {
      message.error(error.response?.data?.error || '保存配置失败');
    }
  };

  const columns = [
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Space>
          {categoryIcons[category]}
          {categoryLabels[category] || category}
        </Space>
      ),
    },
    {
      title: '键名',
      dataIndex: 'key',
      key: 'key',
      width: 150,
      render: (key: string) => <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 2 }}>{key}</code>,
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
      render: (value: any) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {JSON.stringify(value)}
        </Text>
      ),
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
      width: 60,
      render: (enabled: boolean) => enabled ? '启用' : '禁用',
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // Group templates by category
  const groupedTemplates = securityTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof securityTemplates>);

  return (
    <div style={{ padding: 12 }}>
      {/* Header Card */}
      <Card
        size="small"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SafetyOutlined style={{ fontSize: 28, color: 'white' }} />
          <div>
            <Title level={4} style={{ color: 'white', margin: 0 }}>安全配置</Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>配置密码策略、会话管理、访问控制等安全相关设置</Text>
          </div>
        </div>
      </Card>

      {/* Quick Templates */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginTop: 0 }}>
          <Space>
            <KeyOutlined />
            快速添加常用配置
          </Space>
        </Title>
        <Row gutter={[16, 16]}>
          {Object.entries(groupedTemplates).map(([category, templates]) => (
            <Col xs={24} sm={12} md={8} lg={6} key={category}>
              <Card 
                size="small" 
                style={{ 
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
                  height: '100%',
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Space>
                    {categoryIcons[category]}
                    <Text strong>{categoryLabels[category] || category}</Text>
                  </Space>
                </div>
                {templates.map((template, idx) => (
                  <Button 
                    key={idx}
                    size="small" 
                    type="dashed" 
                    block 
                    style={{ marginBottom: 4, textAlign: 'left', height: 'auto', padding: '4px 8px' }}
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    <div style={{ fontSize: 12 }}>{template.description}</div>
                  </Button>
                ))}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Config Table */}
      <Card
        size="small"
        extra={
          <Space>
            <Select
              placeholder="按分类筛选"
              style={{ width: 120 }}
              onChange={setFilterCategory}
              allowClear
              size="small"
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
                <Select.Option key={key} value={key}>{label}</Select.Option>
              ))}
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="small">
              添加配置
            </Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={configs} rowKey="id" loading={loading} size="small" />
      </Card>

      <Modal
        title={editingConfig ? '编辑安全配置' : '创建安全配置'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择分类">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <Select.Option key={key} value={key}>{label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="key" label="键名" rules={[{ required: true, message: '请输入键名' }]}>
            <Input placeholder="配置键名" />
          </Form.Item>
          <Form.Item name="value" label="值（JSON格式）" rules={[{ required: true, message: '请输入值' }]}>
            <Input.TextArea
              placeholder='{"minLength": 8, "requireSpecialChar": true}'
              rows={4}
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="描述" rows={2} />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
