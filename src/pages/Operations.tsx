import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MASTER_NAVIGATION } from '../config/navigation';
import { PagePlaceholder } from '../components/common/PagePlaceholder';
import {
  UtensilsCrossed,
  CheckSquare,
  Coffee,
  Sparkles,
  ShoppingBag,
  Package,
  Trash2,
  Layers,
  Flame,
  Activity,
} from 'lucide-react';
import { permissionService } from '../services/permissionService';
import { OperationsFoundationView } from '../components/operations/OperationsFoundationView';
import { ChecklistShift } from '../components/operations/ChecklistShift';
import { FloorShiftLogs } from '../components/operations/FloorShiftLogs';
import { WastingLogView } from '../components/operations/WastingLogView';
import { InventoryManagementView } from '../components/operations/InventoryManagementView';
import { DailyChecklistHub } from '../components/operations/checklist/DailyChecklistHub';
import { ShiftHandoverHub } from '../components/operations/handover/ShiftHandoverHub';
import { OperationalIssueHub } from '../components/operations/issues/OperationalIssueHub';
import { ProcurementManagementView } from '../components/operations/procurement/ProcurementManagementView';
import { RecipeManagementView } from '../components/operations/recipe/RecipeManagementView';
import { ProductionManagementView } from '../components/operations/production/ProductionManagementView';
import { INITIAL_EMPLOYEES } from '../data/employees';

export default function Operations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const opsModule = MASTER_NAVIGATION.find((m) => m.id === 'operations');

  const availableSubmodules = (opsModule?.submodules || []).filter((sub) =>
    permissionService.canViewSubmodule(currentUser, 'operations', sub)
  );

  const activeSubParam = searchParams.get('sub') || (availableSubmodules[0]?.subParam || 'overview');
  const activeSubmodule = availableSubmodules.find((s) => s.subParam === activeSubParam) || availableSubmodules[0];

  // Match current logged-in user to employee record
  const currentEmployee =
    INITIAL_EMPLOYEES.find((e) => e.id === currentUser?.id || e.email === currentUser?.email) ||
    INITIAL_EMPLOYEES[1];

  const legacyUser = {
    id: currentUser?.id || currentEmployee.id || 'emp-01',
    name: currentUser?.name || currentEmployee.name || 'Staff User',
    email: currentUser?.email || currentEmployee.email || 'staff@tropicalgarden.com',
    role: (currentUser?.role === 'STAFF' ? 'STAFF' : currentUser?.role === 'SUPERVISOR' ? 'SUPERVISOR' : 'MANAGER') as any,
    division: 'OPERATIONS' as any,
  };

  const renderSubmoduleContent = () => {
    switch (activeSubParam) {
      case 'checklists':
      case 'checklist':
        return (
          <div className="space-y-6">
            <DailyChecklistHub currentEmployee={currentEmployee} />
          </div>
        );

      case 'shift':
      case 'handover':
        return (
          <div className="space-y-6">
            <ShiftHandoverHub currentUser={currentUser} />
          </div>
        );

      case 'wasting':
        return (
          <div className="space-y-6">
            <WastingLogView user={legacyUser} />
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <InventoryManagementView
              currentUser={currentUser}
              onReportIssue={() => setSearchParams({ sub: 'issues' })}
            />
          </div>
        );

      case 'issues':
        return (
          <div className="space-y-6">
            <OperationalIssueHub
              currentUser={{
                id: currentEmployee.id,
                name: currentEmployee.name,
                role: currentUser?.role || 'STAFF',
                primaryPosition: currentEmployee.primaryPosition,
              }}
            />
          </div>
        );

      case 'procurement':
      case 'purchasing':
        return (
          <div className="space-y-6">
            <ProcurementManagementView
              currentUser={{
                id: currentEmployee.id,
                name: currentEmployee.name,
                role: currentUser?.role || 'MANAGER',
                email: currentEmployee.email,
              }}
            />
          </div>
        );

      case 'recipes':
        return (
          <div className="space-y-6">
            <RecipeManagementView
              currentUser={{
                id: currentEmployee.id,
                name: currentEmployee.name,
                role: currentUser?.role || 'STAFF',
              }}
            />
          </div>
        );

      case 'production':
        return (
          <div className="space-y-6">
            <ProductionManagementView
              currentUser={{
                id: currentEmployee.id,
                name: currentEmployee.name,
                role: currentUser?.role || 'STAFF',
              }}
            />
          </div>
        );

      // Dedicated Area & Foundation views
      case 'kitchen':
      case 'bar':
      case 'service':
      case 'cleaning':
      case 'stations':
      case 'foundation':
      default:
        return (
          <OperationsFoundationView
            currentEmployee={currentEmployee}
            initialSubTab={activeSubParam === 'kitchen' || activeSubParam === 'bar' || activeSubParam === 'service' ? 'board' : 'overview'}
            onNavigateToChecklist={() => setSearchParams({ sub: 'checklist' })}
          />
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
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-[#1E2438]'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Submodule Component */}
      {renderSubmoduleContent()}
    </div>
  );
}

