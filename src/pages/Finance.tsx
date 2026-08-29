/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FINANCE DOMAIN PAGE
 * Phase 3.9 — Financial Control, Expense/OPEX, Reconciliation & Period Closing Hardening
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MASTER_NAVIGATION } from '../config/navigation';
import { permissionService } from '../services/permissionService';
import { SalesDashboardView } from '../components/operations/sales/SalesDashboardView';
import { CashierRevenueReport } from '../components/finance/CashierRevenueReport';
import { HppDashboardView } from '../components/finance/HppDashboardView';
import { HppCalculatorView } from '../components/finance/HppCalculatorView';
import { FinancialStatementsView } from '../components/finance/FinancialStatementsView';
import { ExpenseManagerView } from '../components/finance/ExpenseManagerView';
import { PeriodControlView } from '../components/finance/PeriodControlView';
import { ReconciliationView } from '../components/finance/ReconciliationView';
import { CriticalBusinessTestsView } from '../components/finance/CriticalBusinessTestsView';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { User, Role } from '../types';
import { BarChart3, Calculator } from 'lucide-react';

export default function Finance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [hppActiveTab, setHppActiveTab] = useState<'matrix' | 'calculator'>('matrix');
  const finModule = MASTER_NAVIGATION.find((m) => m.id === 'finance');

  const availableSubmodules = (finModule?.submodules || []).filter((sub) =>
    permissionService.canViewSubmodule(currentUser, 'finance', sub)
  );

  const activeSubParam = searchParams.get('sub') || (availableSubmodules[0]?.subParam || 'revenue');
  const currentEmployee = INITIAL_EMPLOYEES.find((e) => e.id === currentUser?.id) || INITIAL_EMPLOYEES[0];

  const legacyRole: Role =
    currentUser?.role === 'STAFF'
      ? 'STAFF'
      : currentUser?.role === 'SUPERVISOR'
      ? 'SUPERVISOR'
      : 'MANAGER';

  const legacyUser: User = {
    id: currentUser?.id || 'emp-01',
    name: currentUser?.name || 'Heri Setiawan',
    email: currentUser?.email || 'manager@tropicalgarden.com',
    role: legacyRole,
    division: 'FINANCE',
  };

  const renderContent = () => {
    switch (activeSubParam) {
      case 'revenue':
        return (
          <SalesDashboardView
            canManage={
              currentUser?.role === 'OWNER' ||
              currentUser?.role === 'MANAGER' ||
              currentUser?.role === 'SUPERVISOR'
            }
          />
        );

      case 'cashier':
        return (
          <div className="space-y-6">
            <CashierRevenueReport user={legacyUser} />
          </div>
        );

      case 'hpp':
        return (
          <div className="space-y-6">
            {/* HPP Sub-Navigation Switcher */}
            <div className="bg-[#151B2B] p-1.5 rounded-xl border border-white/10 flex items-center gap-2 max-w-fit">
              <button
                onClick={() => setHppActiveTab('matrix')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  hppActiveTab === 'matrix'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Menu Engineering &amp; Food Cost Matrix
              </button>
              <button
                onClick={() => setHppActiveTab('calculator')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  hppActiveTab === 'calculator'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calculator className="w-4 h-4" />
                Kalkulator Resep &amp; Simulasi Margin HPP
              </button>
            </div>

            {hppActiveTab === 'matrix' ? (
              <HppDashboardView
                currentUser={{
                  id: currentEmployee.id,
                  name: currentEmployee.name,
                  role: currentUser?.role || 'MANAGER',
                }}
              />
            ) : (
              <HppCalculatorView user={legacyUser} />
            )}
          </div>
        );

      case 'expenses':
        return (
          <div className="space-y-6">
            <ExpenseManagerView />
          </div>
        );

      case 'reports':
      case 'profitability':
      default:
        return (
          <div className="space-y-6">
            <FinancialStatementsView user={legacyUser} />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Submodule Navigation Tabs */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {availableSubmodules.map((sub) => {
            const isActive = sub.subParam === activeSubParam;
            return (
              <button
                key={sub.id}
                onClick={() => setSearchParams({ sub: sub.subParam })}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Submodule Content */}
      {renderContent()}
    </div>
  );
}
