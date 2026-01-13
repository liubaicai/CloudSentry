import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Badge } from 'antd';
import {
  DashboardOutlined,
  WarningOutlined,
  BarChartOutlined,
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
      key: 'threat-management',
      icon: <WarningOutlined />,
      label: '威胁管理',
      children: [
        {
          key: '/threats',
          icon: <WarningOutlined />,
          label: '威胁列表',
        },
        {
          key: '/analysis',
          icon: <BarChartOutlined />,
          label: '威胁分析',
        },
      ],
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
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ 
          height: 56, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '0 12px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
            }}>
              <SafetyCertificateOutlined style={{ fontSize: 18, color: 'white' }} />
            </div>
            {!collapsed && (
              <div>
                <div style={{ 
                  color: 'white', 
                  fontSize: 16, 
                  fontWeight: 600,
                  lineHeight: 1.2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  云哨安全
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.5)', 
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
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ 
            fontSize: 13,
            background: 'transparent',
            borderRight: 'none',
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 20px', 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 56,
          lineHeight: '56px',
          borderBottom: '1px solid #e8e8e8',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
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
                background: collapsed ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                style: { fontSize: 16, color: collapsed ? 'white' : '#666' }
              })}
            </div>
            <div style={{
              padding: '4px 12px',
              background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4caf50',
                animation: 'pulse 2s infinite',
              }} />
              <Text style={{ fontSize: 12, color: '#2e7d32' }}>系统运行正常</Text>
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
                <BellOutlined style={{ fontSize: 16, color: '#666' }} />
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                />
                <Text style={{ fontSize: 13 }}>{user?.username}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ 
          margin: '12px', 
          overflow: 'initial',
          background: 'linear-gradient(180deg, #f5f7fa 0%, #e8ebed 100%)',
          borderRadius: 8,
        }}>
          <div style={{ padding: 0, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .ant-menu-dark .ant-menu-item-selected {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%) !important;
          border-radius: 8px;
          margin: 2px 8px;
        }
        .ant-menu-dark .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-radius: 8px;
          margin: 2px 8px;
        }
        .ant-menu-dark .ant-menu-submenu-title:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-radius: 8px;
        }
      `}</style>
    </Layout>
  );
};
