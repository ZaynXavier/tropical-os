import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleGuard } from '../components/auth/RoleGuard';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { permissionService } from '../services/permissionService';

// Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import HR from '../pages/HR';
import CRM from '../pages/CRM';
import Operations from '../pages/Operations';
import Finance from '../pages/Finance';
import Development from '../pages/Development';
import ContentCreator from '../pages/ContentCreator';
import DigitalMarketing from '../pages/DigitalMarketing';
import Reports from '../pages/Reports';
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

        {/* 1. Dashboard */}
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

        {/* 3. Tropical CRM */}
        <Route
          path="crm"
          element={
            <RoleGuard moduleId="crm">
              <CRM />
            </RoleGuard>
          }
        />

        {/* 4. Operations */}
        <Route
          path="operations"
          element={
            <RoleGuard moduleId="operations">
              <Operations />
            </RoleGuard>
          }
        />

        {/* 5. Finance */}
        <Route
          path="finance"
          element={
            <RoleGuard moduleId="finance">
              <Finance />
            </RoleGuard>
          }
        />

        {/* 6. Development */}
        <Route
          path="development"
          element={
            <RoleGuard moduleId="development">
              <Development />
            </RoleGuard>
          }
        />

        {/* 7. Content Creator */}
        <Route
          path="content"
          element={
            <RoleGuard moduleId="content">
              <ContentCreator />
            </RoleGuard>
          }
        />

        {/* 8. Digital Marketing */}
        <Route
          path="marketing"
          element={
            <RoleGuard moduleId="marketing">
              <DigitalMarketing />
            </RoleGuard>
          }
        />

        {/* 9. Reports (MBR) */}
        <Route
          path="reports"
          element={
            <RoleGuard moduleId="reports">
              <Reports />
            </RoleGuard>
          }
        />

        {/* 11. Settings */}
        <Route
          path="settings"
          element={
            <RoleGuard moduleId="settings">
              <Settings />
            </RoleGuard>
          }
        />

        {/* Permission Denied Page */}
        <Route path="permission-denied" element={<PermissionDeniedPage />} />

        {/* 404 Inside Layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
