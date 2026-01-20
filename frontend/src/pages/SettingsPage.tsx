import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Switch, message, Tabs, Row, Col, Space, InputNumber, Divider, Table, Modal, Tag, Popconfirm, Typography } from 'antd';
import { 
  SettingOutlined, 
  CloudOutlined, 
  SafetyOutlined, 
  GlobalOutlined,
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ApiOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { configService } from '../services/configService';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface OpenAIConfig {
  id: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  enabled: boolean;
  description?: string;
}

export const SettingsPage: React.FC = () => {
  const [basicForm] = Form.useForm();
  const [syslogForm] = Form.useForm();
  const [platformForm] = Form.useForm();
  const [brandingForm] = Form.useForm();
  const [openaiForm] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [openaiConfigs, setOpenaiConfigs] = useState<OpenAIConfig[]>([]);
  const [openaiModalVisible, setOpenaiModalVisible] = useState(false);
  const [editingOpenai, setEditingOpenai] = useState<OpenAIConfig | null>(null);
  const [testingOpenai, setTestingOpenai] = useState(false);

  useEffect(() => {
    loadSettings();
    loadOpenAIConfigs();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await configService.settings.getAll();
      
      // Set form values from settings
      basicForm.setFieldsValue({
        retentionDays: data.settings?.retentionDays || 90,
        alertsEnabled: data.settings?.alertsEnabled !== false,
        autoArchive: data.settings?.autoArchive !== false,
        emailNotifications: data.settings?.emailNotifications || '',
      });
      
      syslogForm.setFieldsValue({
        syslogTcpPort: data.settings?.syslogTcpPort || 514,
        syslogUdpPort: data.settings?.syslogUdpPort || 514,
        syslogTcpEnabled: data.settings?.syslogTcpEnabled !== false,
        syslogUdpEnabled: data.settings?.syslogUdpEnabled !== false,
      });
      
      platformForm.setFieldsValue({
        platformIp: data.settings?.platformIp || '',
        platformPort: data.settings?.platformPort || 3000,
        platformHttps: data.settings?.platformHttps || false,
      });
      
      brandingForm.setFieldsValue({
        siteName: data.settings?.siteName || '云卫安全平台',
        siteShortName: data.settings?.siteShortName || '云卫',
        siteDescription: data.settings?.siteDescription || '企业级安全威胁监控与分析平台',
        logoUrl: data.settings?.logoUrl || '',
        faviconUrl: data.settings?.faviconUrl || '',
        primaryColor: data.settings?.primaryColor || '#1890ff',
      });
    } catch {
      message.error('加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  const loadOpenAIConfigs = async () => {
    try {
      const data = await configService.openai.getAll();
      setOpenaiConfigs(data.configs || []);
    } catch {
      console.error('Failed to load OpenAI configs');
    }
  };

  const saveSettings = async (key: string, value: any) => {
    try {
      await configService.settings.update(key, value);
      return true;
    } catch {
      return false;
    }
  };

   const handleBasicSubmit = async (values: any) => {
    try {
      setLoading(true);
      for (const [key, value] of Object.entries(values)) {
        await saveSettings(key, value);
      }
      message.success('基本设置保存成功');
    } catch {
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSyslogSubmit = async (values: any) => {
    try {
      setLoading(true);
      for (const [key, value] of Object.entries(values)) {
        await saveSettings(key, value);
      }
      message.success('Syslog设置保存成功');
    } catch {
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformSubmit = async (values: any) => {
    try {
      setLoading(true);
      for (const [key, value] of Object.entries(values)) {
        await saveSettings(key, value);
      }
      message.success('平台设置保存成功');
    } catch {
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandingSubmit = async (values: any) => {
    try {
      setLoading(true);
      for (const [key, value] of Object.entries(values)) {
        await saveSettings(key, value);
      }
      message.success('品牌设置保存成功');
    } catch {
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAICreate = () => {
    setEditingOpenai(null);
    openaiForm.resetFields();
    openaiForm.setFieldsValue({
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      enabled: true,
    });
    setOpenaiModalVisible(true);
  };

  const handleOpenAIEdit = (config: OpenAIConfig) => {
    setEditingOpenai(config);
    openaiForm.setFieldsValue({
      baseUrl: config.baseUrl,
      apiKey: '', // Don't show masked key
      model: config.model,
      enabled: config.enabled,
      description: config.description,
    });
    setOpenaiModalVisible(true);
  };

  const handleOpenAIDelete = async (id: string) => {
    try {
      await configService.openai.delete(id);
      message.success('OpenAI配置删除成功');
      loadOpenAIConfigs();
    } catch {
      message.error('删除失败');
    }
  };

  const handleOpenAISubmit = async () => {
    try {
      const values = await openaiForm.validateFields();
      
      if (editingOpenai) {
        // Don't update apiKey if empty
        if (!values.apiKey) {
          delete values.apiKey;
        }
        await configService.openai.update(editingOpenai.id, values);
        message.success('OpenAI配置更新成功');
      } else {
        await configService.openai.create(values);
        message.success('OpenAI配置创建成功');
      }
      
      setOpenaiModalVisible(false);
      loadOpenAIConfigs();
    } catch (error: any) {
      message.error(error.response?.data?.error || '保存失败');
    }
  };

  const handleOpenAITest = async () => {
    try {
      setTestingOpenai(true);
      const result = await configService.openai.test();
      if (result.available) {
        message.success('OpenAI服务连接正常');
      } else {
        message.warning('OpenAI服务不可用');
      }
    } catch {
      message.error('OpenAI服务测试失败');
    } finally {
      setTestingOpenai(false);
    }
  };

  const openaiColumns = [
    {
      title: 'API地址',
      dataIndex: 'baseUrl',
      key: 'baseUrl',
      ellipsis: true,
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      width: 140,
    },
    {
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      width: 140,
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => enabled ? (
        <Tag color="green" icon={<CheckCircleOutlined />}>启用</Tag>
      ) : (
        <Tag color="default" icon={<CloseCircleOutlined />}>禁用</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: any, record: OpenAIConfig) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleOpenAIEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleOpenAIDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
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
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <SettingOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>系统设置</Title>
            <Text type="secondary">配置系统参数、Syslog接收、OpenAI集成及品牌信息</Text>
          </div>
        </div>
      </Card>

      <Card 
        size="small"
        style={{ 
          borderRadius: 8, 
        }}
      >
        <Tabs defaultActiveKey="basic" size="small">
          <TabPane tab={<span><SettingOutlined /> 基本设置</span>} key="basic">
            <Form
              form={basicForm}
              layout="vertical"
              onFinish={handleBasicSubmit}
              style={{ maxWidth: 600 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="数据保留期限（天）"
                    name="retentionDays"
                    rules={[{ required: true, message: '请输入保留期限' }]}
                  >
                    <InputNumber min={1} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="邮件通知" name="emailNotifications">
                    <Input placeholder="admin@example.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="启用告警" name="alertsEnabled" valuePropName="checked">
                    <Switch checkedChildren="开" unCheckedChildren="关" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="自动归档旧事件" name="autoArchive" valuePropName="checked">
                    <Switch checkedChildren="开" unCheckedChildren="关" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存基本设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab={<span><CloudOutlined /> Syslog配置</span>} key="syslog">
            <Form
              form={syslogForm}
              layout="vertical"
              onFinish={handleSyslogSubmit}
              style={{ maxWidth: 600 }}
            >
              <Divider orientation="left" style={{ fontSize: 13 }}>TCP 端口配置</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="TCP端口" name="syslogTcpPort">
                    <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="514" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="启用TCP" name="syslogTcpEnabled" valuePropName="checked">
                    <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" style={{ fontSize: 13 }}>UDP 端口配置</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="UDP端口" name="syslogUdpPort">
                    <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="514" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="启用UDP" name="syslogUdpEnabled" valuePropName="checked">
                    <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存Syslog配置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab={<span><GlobalOutlined /> 平台配置</span>} key="platform">
            <Form
              form={platformForm}
              layout="vertical"
              onFinish={handlePlatformSubmit}
              style={{ maxWidth: 600 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="平台IP地址" name="platformIp">
                    <Input placeholder="192.168.1.100 或 example.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="平台端口" name="platformPort">
                    <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="3000" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="启用HTTPS" name="platformHttps" valuePropName="checked">
                    <Switch checkedChildren="HTTPS" unCheckedChildren="HTTP" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存平台配置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab={<span><ApiOutlined /> OpenAI配置</span>} key="openai">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAICreate} size="small">
                添加配置
              </Button>
              <Button icon={<CheckCircleOutlined />} onClick={handleOpenAITest} loading={testingOpenai} size="small">
                测试连接
              </Button>
            </Space>

            <Table
              columns={openaiColumns}
              dataSource={openaiConfigs}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </TabPane>

          <TabPane tab={<span><PictureOutlined /> 品牌设置</span>} key="branding">
            <Form
              form={brandingForm}
              layout="vertical"
              onFinish={handleBrandingSubmit}
              style={{ maxWidth: 600 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="平台名称" name="siteName">
                    <Input placeholder="云卫安全平台" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="平台简称" name="siteShortName">
                    <Input placeholder="云卫" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="平台描述" name="siteDescription">
                <Input.TextArea rows={2} placeholder="企业级安全威胁监控与分析平台" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Logo URL" name="logoUrl">
                    <Input placeholder="https://example.com/logo.png" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Favicon URL" name="faviconUrl">
                    <Input placeholder="https://example.com/favicon.ico" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="主题色" name="primaryColor">
                <Input type="color" style={{ width: 100, height: 32 }} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存品牌设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab={<span><SafetyOutlined /> 安全策略</span>} key="security">
            <Text style={{ display: 'block', marginBottom: 16, color: 'rgba(0, 0, 0, 0.45)' }}>
              安全策略配置请前往 <a href="#/security" style={{ color: '#1677ff' }}>安全配置</a> 页面进行详细设置
            </Text>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" style={{ textAlign: 'center', background: '#f5f5f5', border: '1px solid #d9d9d9' }}>
                  <SafetyOutlined style={{ fontSize: 32, color: '#22C55E', marginBottom: 8 }} />
                  <div style={{ color: 'rgba(0, 0, 0, 0.88)' }}>密码策略</div>
                  <Text style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>最小长度、复杂度要求</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" style={{ textAlign: 'center', background: '#f5f5f5', border: '1px solid #d9d9d9' }}>
                  <SafetyOutlined style={{ fontSize: 32, color: '#1677ff', marginBottom: 8 }} />
                  <div style={{ color: 'rgba(0, 0, 0, 0.88)' }}>会话管理</div>
                  <Text style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>超时时间、并发控制</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" style={{ textAlign: 'center', background: '#f5f5f5', border: '1px solid #d9d9d9' }}>
                  <SafetyOutlined style={{ fontSize: 32, color: '#F59E0B', marginBottom: 8 }} />
                  <div style={{ color: 'rgba(0, 0, 0, 0.88)' }}>访问控制</div>
                  <Text style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>IP白名单、登录限制</Text>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingOpenai ? '编辑OpenAI配置' : '添加OpenAI配置'}
        open={openaiModalVisible}
        onCancel={() => setOpenaiModalVisible(false)}
        onOk={handleOpenAISubmit}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form form={openaiForm} layout="vertical">
          <Form.Item
            name="baseUrl"
            label="API地址"
            rules={[{ required: true, message: '请输入API地址' }]}
          >
            <Input placeholder="https://api.openai.com/v1" />
          </Form.Item>
          <Form.Item
            name="apiKey"
            label="API Key"
            rules={editingOpenai ? [] : [{ required: true, message: '请输入API Key' }]}
          >
            <Input.Password placeholder={editingOpenai ? '留空保持不变' : 'sk-...'} />
          </Form.Item>
          <Form.Item
            name="model"
            label="模型"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="gpt-3.5-turbo" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="可选描述" />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
