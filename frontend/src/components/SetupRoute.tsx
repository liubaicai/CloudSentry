import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';

interface SetupRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that only allows access to setup page when system is not initialized.
 * If system is already initialized, redirect to login page.
 */
export const SetupRoute: React.FC<SetupRouteProps> = ({ children }) => {
  const { loading, initialized } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // If system is already initialized, redirect to login
  if (initialized) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
