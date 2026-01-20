import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Badge } from 'antd';
import {
  DashboardOutlined,
  WarningOutlined,
  SendOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  GlobalOutlined,
  SafetyOutlined,
  ToolOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/threats',
      icon: <WarningOutlined />,
      label: '威胁管理',
    },
    {
      key: 'integration',
      icon: <SendOutlined />,
      label: '集成管理',
      children: [
        {
          key: '/channels',
          icon: <GlobalOutlined />,
          label: '通道管理',
        },
        {
          key: '/field-mappings',
          icon: <BranchesOutlined />,
          label: '字段映射',
        },
        {
          key: '/alert-forwarding',
          icon: <SendOutlined />,
          label: '告警转发',
        },
      ],
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: '用户管理',
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: '系统设置',
        },
        {
          key: '/system-info',
          icon: <CloudServerOutlined />,
          label: '系统信息',
        },
        {
          key: '/network',
          icon: <GlobalOutlined />,
          label: '网络配置',
        },
        {
          key: '/operations',
          icon: <ToolOutlined />,
          label: '运维配置',
        },
        {
          key: '/security',
          icon: <SafetyOutlined />,
          label: '安全配置',
        },
        {
          key: '/data-management',
          icon: <DatabaseOutlined />,
          label: '数据管理',
        },
      ],
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        width={200}
        theme="light"
        style={{
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div style={{ 
          height: 56, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '0 12px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: '#1677ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SafetyCertificateOutlined style={{ fontSize: 18, color: '#fff' }} />
            </div>
            {!collapsed && (
              <div>
                <div style={{ 
                  color: 'rgba(0, 0, 0, 0.88)', 
                  fontSize: 16, 
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}>
                  云卫安全
                </div>
                <div style={{ 
                  color: 'rgba(0, 0, 0, 0.45)', 
                  fontSize: 10,
                  letterSpacing: 1,
                }}>
                  CLOUD SENTRY
                </div>
              </div>
            )}
          </div>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ 
            fontSize: 13,
            borderRight: 'none',
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 20px', 
          background: '#fff',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 56,
          lineHeight: '56px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div 
              onClick={() => setCollapsed(!collapsed)}
              style={{ 
                width: 36, 
                height: 36, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 8,
                background: collapsed ? '#1677ff' : '#f5f5f5',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                style: { fontSize: 16, color: collapsed ? '#fff' : 'rgba(0, 0, 0, 0.45)' }
              })}
            </div>
            <div style={{
              padding: '4px 12px',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#52c41a',
              }} />
              <Text style={{ fontSize: 12, color: '#52c41a' }}>系统运行正常</Text>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={0} size="small">
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <BellOutlined style={{ fontSize: 16, color: 'rgba(0, 0, 0, 0.45)' }} />
              </div>
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                padding: '4px 12px',
                borderRadius: 8,
                background: '#f5f5f5',
              }}>
                <Avatar 
                  size={28} 
                  icon={<UserOutlined />}
                  style={{
                    background: '#bfbfbf',
                    color: '#fff',
                  }}
                />
                <Text style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.88)' }}>{user?.username}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ 
          margin: '12px', 
          overflow: 'initial',
          background: '#f0f2f5',
          borderRadius: 8,
        }}>
          <div style={{ padding: 0, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
