/**
 * TROPICALOS — Tropical Garden Resto Operating System
 * Phase 0: Frontend Foundation
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './app/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}
