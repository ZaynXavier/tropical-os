import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleGuard } from '../components/auth/RoleGuard';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { permissionService } from '../services/permissionService';

// 6 Core Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import HR from '../pages/HR';
import Operations from '../pages/Operations';
import Finance from '../pages/Finance';
import CRM from '../pages/CRM';
import Settings from '../pages/Settings';
import PermissionDeniedPage from '../pages/PermissionDenied';
import NotFound from '../pages/NotFound';

const HomeRedirect: React.FC = () => {
  const { currentUser } = useAuth();
  if (currentUser && permissionService.isHROfficer(currentUser) && currentUser.accessLevel !== 'OWNER' && currentUser.accessLevel !== 'MANAGER') {
    return <Navigate to="/hr" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

const DashboardRouteWrapper: React.FC = () => {
  const { currentUser } = useAuth();
  if (currentUser && permissionService.isHROfficer(currentUser) && currentUser.accessLevel !== 'OWNER' && currentUser.accessLevel !== 'MANAGER') {
    return <Navigate to="/hr" replace />;
  }
  return (
    <RoleGuard moduleId="dashboard">
      <Dashboard />
    </RoleGuard>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Application Routes inside AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeRedirect />} />

        {/* 1. Executive Dashboard */}
        <Route
          path="dashboard"
          element={<DashboardRouteWrapper />}
        />

        {/* 2. Tropical HR */}
        <Route
          path="hr"
          element={
            <RoleGuard moduleId="hr">
              <HR />
            </RoleGuard>
          }
        />

        {/* 3. Kitchen & Operations */}
        <Route
          path="operations"
          element={
            <RoleGuard moduleId="operations">
              <Operations />
            </RoleGuard>
          }
        />

        {/* 4. Sales & Finance POS */}
        <Route
          path="finance"
          element={
            <RoleGuard moduleId="finance">
              <Finance />
            </RoleGuard>
          }
        />
        <Route path="sales" element={<Navigate to="/finance" replace />} />

        {/* 5. Tropical CRM & Marketing */}
        <Route
          path="crm"
          element={
            <RoleGuard moduleId="crm">
              <CRM />
            </RoleGuard>
          }
        />

        {/* 6. Settings & System */}
        <Route
          path="settings"
          element={
            <RoleGuard moduleId="settings">
              <Settings />
            </RoleGuard>
          }
        />

        {/* Seamless Legacy Redirects to 6 Core Pillars */}
        <Route path="hpp" element={<Navigate to="/operations?sub=recipes" replace />} />
        <Route path="development" element={<Navigate to="/hr?sub=sop" replace />} />
        <Route path="content" element={<Navigate to="/crm?sub=content" replace />} />
        <Route path="marketing" element={<Navigate to="/crm?sub=content" replace />} />
        <Route path="reports" element={<Navigate to="/dashboard" replace />} />

        {/* Permission Denied Page */}
        <Route path="permission-denied" element={<PermissionDeniedPage />} />

        {/* 404 Inside Layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
