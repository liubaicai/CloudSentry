import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Steps, InputNumber, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined, SettingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { setupService } from '../services/setupService';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;

interface AdminFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SettingsFormData {
  siteName?: string;
  syslogPort?: number;
  dataRetentionDays?: number;
}

export const SetupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState<AdminFormData | null>(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [adminForm] = Form.useForm();
  const [settingsForm] = Form.useForm();

  const steps = [
    {
      title: '欢迎',
      icon: <SafetyOutlined />,
    },
    {
      title: '管理员账户',
      icon: <UserOutlined />,
    },
    {
      title: '基本设置',
      icon: <SettingOutlined />,
    },
    {
      title: '完成',
      icon: <CheckCircleOutlined />,
    },
  ];

  const handleAdminSubmit = async (values: AdminFormData) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    setAdminData(values);
    setCurrentStep(2);
  };

  const handleSettingsSubmit = async (values: SettingsFormData) => {
    if (!adminData) {
      message.error('请先填写管理员信息');
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    try {
      await setupService.completeSetup({
        admin: {
          username: adminData.username,
          email: adminData.email,
          password: adminData.password,
        },
        settings: values,
      });
      setCurrentStep(3);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : '初始化失败';
      message.error(errorMessage || '初始化失败');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    await refreshUser();
    message.success('欢迎使用云卫安全平台');
    navigate('/');
  };

  const renderWelcome = () => (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <SafetyOutlined style={{ fontSize: 64, color: '#1677ff', marginBottom: 24 }} />
      <Title level={2} style={{ color: 'rgba(0, 0, 0, 0.88)', marginBottom: 16 }}>
        欢迎使用云卫安全平台
      </Title>
      <Paragraph style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 16, marginBottom: 32 }}>
        这是一个安全事件管理系统，帮助您收集、分析和响应安全威胁。
        <br />
        在开始使用之前，我们需要完成一些基本配置。
      </Paragraph>
      <Button type="primary" size="large" onClick={() => setCurrentStep(1)}>
        开始配置
      </Button>
    </div>
  );

  const renderAdminForm = () => (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <Title level={4} style={{ color: 'rgba(0, 0, 0, 0.88)', marginBottom: 8 }}>
        创建管理员账户
      </Title>
      <Paragraph style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: 24 }}>
        请设置管理员账户信息，该账户将拥有系统的最高权限。
      </Paragraph>
      <Form
        form={adminForm}
        onFinish={handleAdminSubmit}
        layout="vertical"
        initialValues={adminData || undefined}
      >
        <Form.Item
          name="username"
          label={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>用户名</span>}
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, message: '用户名至少3个字符' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="管理员用户名" size="large" />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>邮箱</span>}
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="管理员邮箱" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>密码</span>}
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="设置密码" size="large" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>确认密码</span>}
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="确认密码" size="large" />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentStep(0)}>
              上一步
            </Button>
            <Button type="primary" htmlType="submit" size="large">
              下一步
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  const renderSettingsForm = () => (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <Title level={4} style={{ color: 'rgba(0, 0, 0, 0.88)', marginBottom: 8 }}>
        基本设置
      </Title>
      <Paragraph style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: 24 }}>
        配置系统的基本参数，这些设置可以在之后修改。
      </Paragraph>
      <Form
        form={settingsForm}
        onFinish={handleSettingsSubmit}
        layout="vertical"
        initialValues={{
          siteName: '云卫安全平台',
          syslogPort: 514,
          dataRetentionDays: 90,
        }}
      >
        <Form.Item
          name="siteName"
          label={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>系统名称</span>}
        >
          <Input placeholder="系统名称" size="large" />
        </Form.Item>

        <Form.Item
          name="syslogPort"
          label={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>Syslog 端口</span>}
          tooltip="接收syslog日志的端口号"
        >
          <InputNumber 
            min={1} 
            max={65535} 
            placeholder="514" 
            size="large" 
            style={{ width: '100%' }} 
          />
        </Form.Item>

        <Form.Item
          name="dataRetentionDays"
          label={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>数据保留天数</span>}
          tooltip="安全事件数据的保留时间"
        >
          <InputNumber 
            min={7} 
            max={365} 
            placeholder="90" 
            size="large" 
            style={{ width: '100%' }} 
            addonAfter="天"
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentStep(1)}>
              上一步
            </Button>
            <Button type="primary" htmlType="submit" size="large" loading={loading}>
              完成配置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  const renderComplete = () => (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <CheckCircleOutlined style={{ fontSize: 64, color: '#22C55E', marginBottom: 24 }} />
      <Title level={2} style={{ color: 'rgba(0, 0, 0, 0.88)', marginBottom: 16 }}>
        配置完成！
      </Title>
      <Paragraph style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 16, marginBottom: 32 }}>
        系统已成功初始化，您现在可以开始使用云卫安全平台了。
      </Paragraph>
      <Button type="primary" size="large" onClick={handleComplete}>
        进入系统
      </Button>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderWelcome();
      case 1:
        return renderAdminForm();
      case 2:
        return renderSettingsForm();
      case 3:
        return renderComplete();
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)',
      padding: '40px 20px',
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 600, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
          borderRadius: 8,
        }} 
        bordered={false}
      >
        <div style={{ marginBottom: 32 }}>
          <Steps 
            current={currentStep} 
            items={steps}
            size="small"
          />
        </div>
        {renderStepContent()}
      </Card>
    </div>
  );
};
