import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
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

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
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
