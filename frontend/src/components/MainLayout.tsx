import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
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
          icon: <SettingOutlined />,
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
      <Sider trigger={null} collapsible collapsed={collapsed} width={200}>
        <div style={{ 
          height: 48, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold',
          background: 'rgba(255,255,255,0.1)',
          margin: 8,
          borderRadius: 4,
        }}>
          {collapsed ? '云哨' : '云哨安全平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ fontSize: 13 }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 48,
          lineHeight: '48px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: 16, cursor: 'pointer' }
            })}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <Text style={{ fontSize: 13 }}>{user?.username}</Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '12px', overflow: 'initial' }}>
          <div style={{ padding: 0, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
