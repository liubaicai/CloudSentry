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
        algorithm: undefined, // We use custom dark colors instead of algorithm.darkAlgorithm
        token: {
          // Dark theme: dark neutrals, minimal decoration
          colorPrimary: '#60A5FA',
          colorInfo: '#38BDF8',
          colorLink: '#38BDF8',

          colorBgLayout: '#0F172A',
          colorBgContainer: '#1E293B',
          colorBgElevated: '#334155',

          colorText: '#E2E8F0',
          colorTextHeading: '#F8FAFC',
          colorTextSecondary: '#94A3B8',

          colorBorder: '#334155',
          colorBorderSecondary: '#1E293B',

          borderRadius: 4,
          borderRadiusSM: 2,
          borderRadiusLG: 6,

          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          fontFamilyCode:
            "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",

          fontSize: 13,
        },
        components: {
          Button: {
            controlHeight: 32,
            contentFontSize: 13,
            fontWeight: 500,
          },
          Card: {
            paddingLG: 12,
            headerFontSize: 14,
            colorBgContainer: '#1E293B',
          },
          Table: {
            cellPaddingBlock: 8,
            cellPaddingInline: 12,
            headerBg: '#0F172A',
            headerColor: '#94A3B8',
            borderColor: '#334155',
            fontSize: 13,
            colorBgContainer: '#1E293B',
          },
          Menu: {
            itemSelectedBg: '#334155',
            itemSelectedColor: '#F8FAFC',
            darkItemBg: '#0F172A',
            darkSubMenuItemBg: '#0F172A',
          },
          Input: {
            activeBorderColor: '#60A5FA',
            hoverBorderColor: '#475569',
            colorBgContainer: '#1E293B',
          },
          Select: {
            colorBgContainer: '#1E293B',
            colorBgElevated: '#334155',
          },
          Modal: {
            contentBg: '#1E293B',
            headerBg: '#1E293B',
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
