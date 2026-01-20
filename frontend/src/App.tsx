import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
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
        algorithm: theme.defaultAlgorithm,
        token: {
          // Light Theme
          colorPrimary: '#1677ff',
          
          // Metrics
          borderRadius: 6,
          borderRadiusSM: 4,
          borderRadiusLG: 12,

          // Fonts
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          fontFamilyCode:
            "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
        },
        components: {
          Button: {
            controlHeight: 36,
          },
          Card: {
            paddingLG: 24,
            headerFontSize: 16,
            fontWeightStrong: 600,
          },
          Table: {
            headerBg: '#fafafa',
            headerColor: 'rgba(0, 0, 0, 0.88)',
          },
          Menu: {
            iconSize: 16,
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
