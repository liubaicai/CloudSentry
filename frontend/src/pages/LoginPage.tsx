import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Spin } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loading: authLoading, initialized, user } = useAuth();

  // Redirect to setup if not initialized, or to home if already logged in
  useEffect(() => {
    if (!authLoading) {
      if (!initialized) {
        navigate('/setup');
      } else if (user) {
        navigate('/');
      }
    }
  }, [authLoading, initialized, user, navigate]);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功');
      navigate('/');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : '登录失败';
      message.error(errorMessage || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)'
    }}>
      <Card style={{ width: 380, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <SafetyOutlined style={{ fontSize: 40, color: '#1677ff', marginBottom: 8 }} />
          <Title level={3} style={{ marginBottom: 4, color: 'rgba(0, 0, 0, 0.88)' }}>云卫安全平台</Title>
          <Text style={{ color: 'rgba(0, 0, 0, 0.45)' }}>安全事件管理系统</Text>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
