import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { MainLayout } from './components/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ThreatListPage } from './pages/ThreatListPage';
import { ThreatDetailPage } from './pages/ThreatDetailPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { AlertForwardingPage } from './pages/AlertForwardingPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { NetworkConfigPage } from './pages/NetworkConfigPage';
import { OperationsConfigPage } from './pages/OperationsConfigPage';
import { SecurityConfigPage } from './pages/SecurityConfigPage';
import { DataManagementPage } from './pages/DataManagementPage';
import ChannelManagementPage from './pages/ChannelManagementPage';
import FieldMappingPage from './pages/FieldMappingPage';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          // Light geek: cool neutrals, minimal decoration
          colorPrimary: '#334155',
          colorInfo: '#0284C7',
          colorLink: '#0284C7',

          colorBgLayout: '#F8FAFC',
          colorBgContainer: '#FFFFFF',

          colorText: '#334155',
          colorTextHeading: '#0F172A',
          colorTextSecondary: '#64748B',

          colorBorder: '#E2E8F0',
          colorBorderSecondary: '#F1F5F9',

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
          },
          Table: {
            cellPaddingBlock: 8,
            cellPaddingInline: 12,
            headerBg: '#F8FAFC',
            headerColor: '#64748B',
            borderColor: '#E2E8F0',
            fontSize: 13,
          },
          Menu: {
            itemSelectedBg: '#F1F5F9',
            itemSelectedColor: '#0F172A',
          },
          Input: {
            activeBorderColor: '#0F172A',
            hoverBorderColor: '#94A3B8',
          },
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
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
              <Route path="analysis" element={<AnalysisPage />} />
              <Route path="alert-forwarding" element={<AlertForwardingPage />} />
              <Route path="channels" element={<ChannelManagementPage />} />
              <Route path="field-mappings" element={<FieldMappingPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="network" element={<NetworkConfigPage />} />
              <Route path="operations" element={<OperationsConfigPage />} />
              <Route path="security" element={<SecurityConfigPage />} />
              <Route path="data-management" element={<DataManagementPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
