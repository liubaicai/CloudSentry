import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { SetupRoute } from './components/SetupRoute';
import { MainLayout } from './components/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { SetupPage } from './pages/SetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ThreatListPage } from './pages/ThreatListPage';
import { ThreatDetailPage } from './pages/ThreatDetailPage';
import { AlertForwardingPage } from './pages/AlertForwardingPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { NetworkConfigPage } from './pages/NetworkConfigPage';
import { OperationsConfigPage } from './pages/OperationsConfigPage';
import { SecurityConfigPage } from './pages/SecurityConfigPage';
import { DataManagementPage } from './pages/DataManagementPage';
import ChannelManagementPage from './pages/ChannelManagementPage';
import FieldMappingPage from './pages/FieldMappingPage';
import { SystemInfoPage } from './pages/SystemInfoPage';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: undefined, // We use custom dark colors
        token: {
          // Exquisite Dark Theme: Deep Space Glass
          // Base Colors
          colorPrimary: '#63a4f5', // Softer, refined blue as requested
          colorInfo: '#38BDF8',
          colorLink: '#38BDF8',
          colorSuccess: '#10B981',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',

          // Layout & Surfaces
          colorBgLayout: '#0B1121', // Deepest navy/black
          colorBgContainer: '#151e32', // Slightly lighter for base containers
          colorBgElevated: '#1E293B',

          // Typography
          colorText: '#F1F5F9', // Slate 100 - High contrast
          colorTextHeading: '#FFFFFF', // Pure white for headings
          colorTextSecondary: '#94A3B8', // Slate 400

          // Borders & Dividers
          colorBorder: 'rgba(255, 255, 255, 0.08)', // Subtle translucent border
          colorBorderSecondary: 'rgba(255, 255, 255, 0.04)',

          // Metrics
          borderRadius: 6, // Slightly softer corners
          borderRadiusSM: 4,
          borderRadiusLG: 12, // Larger radius for cards

          // Fonts
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          fontFamilyCode:
            "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",

          fontSize: 14, // Increased base size for readability
        },
        components: {
          Button: {
            controlHeight: 36, // Taller, more tactile buttons
            contentFontSize: 14,
            fontWeight: 500,
            primaryShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)', // Glow effect
            defaultBorderColor: 'rgba(255,255,255,0.1)',
            defaultBg: 'rgba(255,255,255,0.02)',
          },
          Card: {
            paddingLG: 24, // More breathing room
            headerFontSize: 16,
            fontWeightStrong: 600,
            colorBgContainer: 'transparent', // Handled by CSS for glass effect
          },
          Table: {
            headerBg: 'rgba(15, 23, 42, 0.6)', // Semi-transparent header
            headerColor: '#94A3B8',
            rowHoverBg: 'rgba(59, 130, 246, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.06)',
            fontSize: 14,
            colorBgContainer: 'transparent',
          },
          Menu: {
            itemSelectedBg: 'rgba(59, 130, 246, 0.1)',
            itemSelectedColor: '#60A5FA',
            itemHoverBg: 'rgba(255, 255, 255, 0.03)',
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            iconSize: 16,
          },
          Input: {
            activeBorderColor: '#3B82F6',
            hoverBorderColor: 'rgba(255, 255, 255, 0.2)',
            colorBgContainer: 'rgba(0, 0, 0, 0.2)', // Dark input background
            colorBorder: 'rgba(255, 255, 255, 0.1)',
          },
          Select: {
            colorBgContainer: 'rgba(0, 0, 0, 0.2)',
            colorBgElevated: '#1E293B',
            colorBorder: 'rgba(255, 255, 255, 0.1)',
          },
          Modal: {
            contentBg: '#151e32',
            headerBg: '#151e32',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
          },
          Tag: {
            defaultBg: 'rgba(255, 255, 255, 0.05)',
            defaultColor: '#E2E8F0',
          },
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/setup" element={<SetupRoute><SetupPage /></SetupRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="threats" element={<ThreatListPage />} />
              <Route path="threats/:id" element={<ThreatDetailPage />} />
              <Route path="alert-forwarding" element={<AlertForwardingPage />} />
              <Route path="channels" element={<ChannelManagementPage />} />
              <Route path="field-mappings" element={<FieldMappingPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="network" element={<NetworkConfigPage />} />
              <Route path="operations" element={<OperationsConfigPage />} />
              <Route path="security" element={<SecurityConfigPage />} />
              <Route path="data-management" element={<DataManagementPage />} />
              <Route path="system-info" element={<SystemInfoPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
