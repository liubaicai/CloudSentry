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
        theme="dark"
        style={{
          background: '#0F172A',
          borderRight: '1px solid #334155',
        }}
      >
        <div style={{ 
          height: 56, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '0 12px',
          borderBottom: '1px solid #334155',
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
              background: '#60A5FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SafetyCertificateOutlined style={{ fontSize: 18, color: '#0F172A' }} />
            </div>
            {!collapsed && (
              <div>
                <div style={{ 
                  color: '#F8FAFC', 
                  fontSize: 16, 
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}>
                  云卫安全
                </div>
                <div style={{ 
                  color: '#94A3B8', 
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
            borderRight: 'none',
            background: '#0F172A',
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 20px', 
          background: '#1E293B',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 56,
          lineHeight: '56px',
          borderBottom: '1px solid #334155',
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
                background: collapsed ? '#60A5FA' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                style: { fontSize: 16, color: collapsed ? '#0F172A' : '#94A3B8' }
              })}
            </div>
            <div style={{
              padding: '4px 12px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#22C55E',
              }} />
              <Text style={{ fontSize: 12, color: '#22C55E' }}>系统运行正常</Text>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={0} size="small">
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <BellOutlined style={{ fontSize: 16, color: '#94A3B8' }} />
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
                background: '#334155',
              }}>
                <Avatar 
                  size={28} 
                  icon={<UserOutlined />}
                  style={{
                    background: '#475569',
                    color: '#E2E8F0',
                  }}
                />
                <Text style={{ fontSize: 13, color: '#E2E8F0' }}>{user?.username}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ 
          margin: '12px', 
          overflow: 'initial',
          background: '#0F172A',
          borderRadius: 8,
        }}>
          <div style={{ padding: 0, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
      <style>{`
        .ant-menu-dark .ant-menu-item-selected {
          background-color: #334155 !important;
          color: #F8FAFC !important;
          font-weight: 600;
          border-radius: 6px;
          margin: 4px 8px;
          width: calc(100% - 16px);
        }
        .ant-menu-dark .ant-menu-item {
          margin: 4px 8px;
          width: calc(100% - 16px);
          border-radius: 6px;
          color: #94A3B8;
        }
        .ant-menu-dark .ant-menu-item:hover {
          color: #F8FAFC !important;
          background-color: #1E293B !important;
        }
        .ant-menu-dark .ant-menu-submenu-title {
          color: #94A3B8 !important;
        }
        .ant-menu-dark .ant-menu-submenu-title:hover {
          color: #F8FAFC !important;
        }
        .ant-menu-dark.ant-menu-inline .ant-menu-sub.ant-menu-inline {
          background: #0F172A !important;
        }
        .ant-layout-sider-trigger {
          background: #0F172A !important;
          color: #F8FAFC !important;
          border-top: 1px solid #334155;
        }
      `}</style>
    </Layout>
  );
};
