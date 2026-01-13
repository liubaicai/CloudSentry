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
        theme="light"
        style={{
          background: '#ffffff',
          borderRight: '1px solid #E2E8F0',
        }}
      >
        <div style={{ 
          height: 56, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '0 12px',
          borderBottom: '1px solid #E2E8F0',
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
              background: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SafetyCertificateOutlined style={{ fontSize: 18, color: 'white' }} />
            </div>
            {!collapsed && (
              <div>
                <div style={{ 
                  color: '#0F172A', 
                  fontSize: 16, 
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}>
                  云卫安全
                </div>
                <div style={{ 
                  color: '#64748B', 
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
          background: '#ffffff',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 56,
          lineHeight: '56px',
          borderBottom: '1px solid #E2E8F0',
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
                background: collapsed ? '#0F172A' : '#F1F5F9',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                style: { fontSize: 16, color: collapsed ? 'white' : '#64748B' }
              })}
            </div>
            <div style={{
              padding: '4px 12px',
              background: '#F0FDF4',
              border: '1px solid #DCFCE7',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#16A34A',
              }} />
              <Text style={{ fontSize: 12, color: '#15803D' }}>系统运行正常</Text>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={0} size="small">
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <BellOutlined style={{ fontSize: 16, color: '#64748B' }} />
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
                background: '#F1F5F9',
              }}>
                <Avatar 
                  size={28} 
                  icon={<UserOutlined />}
                  style={{
                    background: '#CBD5E1',
                    color: '#475569',
                  }}
                />
                <Text style={{ fontSize: 13, color: '#334155' }}>{user?.username}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ 
          margin: '12px', 
          overflow: 'initial',
          background: '#F8FAFC',
          borderRadius: 8,
        }}>
          <div style={{ padding: 0, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
      <style>{`
        .ant-menu-light .ant-menu-item-selected {
          background-color: #F1F5F9 !important;
          color: #0F172A !important;
          font-weight: 600;
          border-radius: 6px;
          margin: 4px 8px;
          width: calc(100% - 16px);
        }
        .ant-menu-light .ant-menu-item {
          margin: 4px 8px;
          width: calc(100% - 16px);
          border-radius: 6px;
          color: #64748B;
        }
        .ant-menu-light .ant-menu-item:hover {
          color: #0F172A !important;
          background-color: #F8FAFC !important;
        }
        .ant-menu-submenu-title {
          color: #64748B !important;
        }
        .ant-menu-submenu-title:hover {
          color: #0F172A !important;
        }
        .ant-layout-sider-trigger {
          background: #ffffff !important;
          color: #0F172A !important;
          border-top: 1px solid #E2E8F0;
        }
      `}</style>
    </Layout>
  );
};
