import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardPeriod, CustomDateRange, ExecutiveKPI, SalesPerformanceData, MenuPerformanceData, FoodCostData, InventoryData, LaborData, OpexData, CustomerExperienceData, QualityPeopleData, ManagementIssue, SupervisorOperationalData } from '../data/dashboard/types';
import { DashboardService } from '../services/dashboardService';
import { permissionService } from '../services/permissionService';

// Dashboard Components
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { ExecutiveKpiGrid } from '../components/dashboard/ExecutiveKpiGrid';
import { UpcomingReservationsSection } from '../components/dashboard/UpcomingReservationsSection';
import { OwnerDirectivesSection } from '../components/dashboard/OwnerDirectivesSection';
import { SalesPerformanceSection } from '../components/dashboard/SalesPerformanceSection';
import { MenuPerformanceSection } from '../components/dashboard/MenuPerformanceSection';
import { FoodCostSection } from '../components/dashboard/FoodCostSection';
import { InventorySection } from '../components/dashboard/InventorySection';
import { LaborSection } from '../components/dashboard/LaborSection';
import { OpexSection } from '../components/dashboard/OpexSection';
import { CustomerExperienceSection } from '../components/dashboard/CustomerExperienceSection';
import { QualityPeopleSection } from '../components/dashboard/QualityPeopleSection';
import { ManagementIssuesSection } from '../components/dashboard/ManagementIssuesSection';
import { SupervisorCommandCenter } from '../components/dashboard/SupervisorCommandCenter';
import { StaffPersonalDashboard } from '../components/dashboard/StaffPersonalDashboard';
import { geminiService } from '../services/geminiService';

import {
  TrendingUp,
  UtensilsCrossed,
  Utensils,
  Boxes,
  Users,
  Zap,
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Sparkles,
  Award,
  Calendar,
  Send,
  Brain,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type DimensionTab =
  | 'ALL'
  | 'RESERVATIONS'
  | 'DIRECTIVES'
  | 'SALES'
  | 'MENU'
  | 'FOOD_COST'
  | 'INVENTORY'
  | 'LABOR'
  | 'OPEX'
  | 'CX'
  | 'QUALITY_PEOPLE'
  | 'ISSUES';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const canViewKpi = permissionService.canViewKpi(currentUser);

  // Period State
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('month');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({
    startDate: '2025-05-01',
    endDate: '2025-05-31',
  });
  const [activeTab, setActiveTab] = useState<DimensionTab>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // AI Insights State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Data States
  const [kpiData, setKpiData] = useState<ExecutiveKPI | null>(null);
  const [salesData, setSalesData] = useState<SalesPerformanceData | null>(null);
  const [menuData, setMenuData] = useState<MenuPerformanceData | null>(null);
  const [foodCostData, setFoodCostData] = useState<FoodCostData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
  const [laborData, setLaborData] = useState<LaborData | null>(null);
  const [opexData, setOpexData] = useState<OpexData | null>(null);
  const [cxData, setCxData] = useState<CustomerExperienceData | null>(null);
  const [qualityPeopleData, setQualityPeopleData] = useState<QualityPeopleData | null>(null);
  const [issuesData, setIssuesData] = useState<ManagementIssue[]>([]);
  const [supervisorData, setSupervisorData] = useState<SupervisorOperationalData | null>(null);

  // Fetch all dashboard analytical data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        kpi,
        sales,
        menu,
        foodCost,
        inventory,
        labor,
        opex,
        cx,
        qualityPeople,
        issues,
        supervisor,
      ] = await Promise.all([
        DashboardService.getExecutiveKpi(selectedPeriod, customDateRange),
        DashboardService.getSalesPerformance(selectedPeriod, customDateRange),
        DashboardService.getMenuPerformance(selectedPeriod, customDateRange),
        DashboardService.getFoodCostSummary(selectedPeriod, customDateRange),
        DashboardService.getInventorySummary(selectedPeriod, customDateRange),
        DashboardService.getLaborSummary(selectedPeriod, customDateRange),
        DashboardService.getOpexSummary(selectedPeriod, customDateRange),
        DashboardService.getCustomerExperience(selectedPeriod, customDateRange),
        DashboardService.getQualityPeopleSummary(selectedPeriod, customDateRange),
        DashboardService.getManagementIssues(),
        DashboardService.getSupervisorOperationalData(),
      ]);

      setKpiData(kpi);
      setSalesData(sales);
      setMenuData(menu);
      setFoodCostData(foodCost);
      setInventoryData(inventory);
      setLaborData(labor);
      setOpexData(opex);
      setCxData(cx);
      setQualityPeopleData(qualityPeople);
      setIssuesData(issues);
      setSupervisorData(supervisor);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, customDateRange]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // If user is regular STAFF or Section HEAD without KPI privileges (Andun, Alfan, Dina, Vita, Aqib), show their personal task board
  if (currentUser?.accessLevel === 'STAFF' || (currentUser?.accessLevel === 'HEAD' && !canViewKpi)) {
    return <StaffPersonalDashboard user={currentUser} />;
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today':
        return 'Hari Ini';
      case 'week':
        return 'Minggu Ini';
      case 'month':
        return `Bulan ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())}`;
      case 'custom':
        return `${customDateRange.startDate} - ${customDateRange.endDate}`;
    }
  };

  const isOwner = currentUser?.accessLevel === 'OWNER';

  // Base Dimension Tabs with permission flags
  const rawDimensionNavTabs: { key: DimensionTab; label: string; icon: React.ReactNode; requiresKpi?: boolean }[] = [
    { key: 'ALL', label: 'Semua Dimensi (Command Center)', icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'RESERVATIONS', label: '📅 Jadwal Reservasi Mendatang', icon: <Calendar className="w-3.5 h-3.5" /> },
    { key: 'DIRECTIVES', label: '🎯 Arahan Owner & GM', icon: <Send className="w-3.5 h-3.5" />, requiresKpi: true },
    { key: 'SALES', label: '1. Sales & Revenue', icon: <TrendingUp className="w-3.5 h-3.5" />, requiresKpi: true },
    { key: 'MENU', label: '2. Menu Engineering', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { key: 'FOOD_COST', label: '3. Food Cost & HPP', icon: <Utensils className="w-3.5 h-3.5" />, requiresKpi: true },
    { key: 'INVENTORY', label: '4. Inventory & FEFO', icon: <Boxes className="w-3.5 h-3.5" /> },
    { key: 'LABOR', label: '5. Labor & SDM', icon: <Users className="w-3.5 h-3.5" />, requiresKpi: true },
    { key: 'OPEX', label: '6. OPEX & Utilitas', icon: <Zap className="w-3.5 h-3.5" />, requiresKpi: true },
    { key: 'CX', label: '7. CX & Tamu', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
    { key: 'QUALITY_PEOPLE', label: '8-9. Quality & SOP', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { key: 'ISSUES', label: '10. Action Items', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  ];

  const dimensionNavTabs = rawDimensionNavTabs.filter((tab) => !tab.requiresKpi || canViewKpi);

  const handleRunAiAnalysis = async () => {
    if (!kpiData) return;
    setIsAiLoading(true);
    const res = await geminiService.analyzeKpi(kpiData, getPeriodLabel());
    setIsAiLoading(false);
    if (res.success && res.data?.analysis) {
      setAiAnalysis(res.data.analysis);
    } else {
      alert(res.message || 'Gagal memanggil AI Gemini.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white pb-12">
      {/* 1. Global Command Center Header */}
      <DashboardHeader
        currentUser={currentUser}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        customDateRange={customDateRange}
        onCustomDateChange={setCustomDateRange}
        onRefresh={loadDashboardData}
        isLoading={isLoading}
      />

      {/* If SUPERVISOR, show Supervisor Command Center prominently at the top */}
      {currentUser?.accessLevel === 'SUPERVISOR' && supervisorData && (
        <SupervisorCommandCenter data={supervisorData} currentUser={currentUser} />
      )}

      {/* 2. Executive Key Performance Indicators Grid (Hanya untuk Owner, Manager, dan Finance) */}
      {canViewKpi && kpiData && (
        <ExecutiveKpiGrid
          kpi={kpiData}
          user={currentUser}
          periodLabel={getPeriodLabel()}
        />
      )}

      {/* Gemini AI Strategic Diagnostician Banner (Owner / Manager / Executive) */}
      {canViewKpi && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A103C] via-[#120D2C] to-[#0A071E] border border-purple-500/30 p-6 sm:p-7 shadow-2xl shadow-purple-900/20">
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30 text-white">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Diagnosa Bisnis Cerdas (Google Gemini AI)
                  </h3>
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Live AI
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  Analisis tren laba, efisiensi food cost, dan saran strategis otomatis untuk {getPeriodLabel()}
                </p>
              </div>
            </div>

            <button
              onClick={handleRunAiAnalysis}
              disabled={isAiLoading}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 hover:scale-105 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {isAiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menganalisis Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{aiAnalysis ? 'Perbarui Analisis AI' : 'Minta Analisis AI Gemini'}</span>
                </>
              )}
            </button>
          </div>

          {/* AI Response Output */}
          {aiAnalysis ? (
            <div className="mt-5 p-5 rounded-2xl bg-white/[0.04] border border-purple-500/20 text-sm text-gray-200 leading-relaxed space-y-3 whitespace-pre-line animate-fade-in font-sans">
              {aiAnalysis}
            </div>
          ) : (
            <div className="mt-4 text-xs text-white/40 italic flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Klik tombol di atas untuk menganalisis data keuangan, penjualan, dan efisiensi resto secara instan.</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Dimension Navigation Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-[#111827] p-1.5 rounded-2xl border border-[#2D374E]">
        {dimensionNavTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Active Analytical Dimension Content Sections */}
      <div className="space-y-6">
        {/* Executive Directives Section (Owner & Manager) */}
        {canViewKpi && (activeTab === 'ALL' || activeTab === 'DIRECTIVES') && (
          <OwnerDirectivesSection currentUser={currentUser} onRefresh={loadDashboardData} />
        )}

        {/* Upcoming Reservations Section */}
        {(activeTab === 'ALL' || activeTab === 'RESERVATIONS') && (
          <UpcomingReservationsSection onRefresh={loadDashboardData} />
        )}

        {/* Dimension 1: Sales Performance (Hanya Owner, Manager, Finance) */}
        {canViewKpi && (activeTab === 'ALL' || activeTab === 'SALES') && salesData && (
          <SalesPerformanceSection data={salesData} />
        )}

        {/* Dimension 2: Menu Engineering */}
        {(activeTab === 'ALL' || activeTab === 'MENU') && menuData && (
          <MenuPerformanceSection data={menuData} />
        )}

        {/* Dimension 3: Food Cost & COGS Variance (Hanya Owner, Manager, Finance) */}
        {canViewKpi && (activeTab === 'ALL' || activeTab === 'FOOD_COST') && foodCostData && (
          <FoodCostSection data={foodCostData} />
        )}

        {/* Dimension 4: Inventory Management & FEFO */}
        {(activeTab === 'ALL' || activeTab === 'INVENTORY') && inventoryData && (
          <InventorySection data={inventoryData} />
        )}

        {/* Dimension 5: Labor Productivity (Hanya Owner, Manager, Finance) */}
        {canViewKpi && (activeTab === 'ALL' || activeTab === 'LABOR') && laborData && (
          <LaborSection data={laborData} />
        )}

        {/* Dimension 6: OPEX & Utilities (Hanya Owner, Manager, Finance) */}
        {canViewKpi && (activeTab === 'ALL' || activeTab === 'OPEX') && opexData && (
          <OpexSection data={opexData} />
        )}

        {/* Dimension 7: Customer Experience & Serving Speed */}
        {(activeTab === 'ALL' || activeTab === 'CX') && cxData && (
          <CustomerExperienceSection data={cxData} />
        )}

        {/* Dimension 8 & 9: Quality Scorecards & People Development */}
        {(activeTab === 'ALL' || activeTab === 'QUALITY_PEOPLE') && qualityPeopleData && (
          <QualityPeopleSection data={qualityPeopleData} />
        )}

        {/* Dimension 10: Management Issues & Action Tracker */}
        {(activeTab === 'ALL' || activeTab === 'ISSUES') && (
          <ManagementIssuesSection
            issues={issuesData}
            onIssuesUpdated={loadDashboardData}
            userRole={currentUser?.accessLevel}
          />
        )}
      </div>

      {/* 5. Quick Access to Core Modules (Only shown for non-OWNER roles who have access) */}
      {!isOwner && (
        <div className="space-y-4 pt-4 border-t border-[#2D374E]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Akses Cepat Modul TropicalOS</span>
            </h2>
            <span className="text-xs text-gray-400">Sesuai Hak Akses RBAC</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/hr"
              className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-purple-500/50 hover:bg-[#283049]/60 transition-all space-y-2 group block"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </span>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-purple-300 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-gray-100 group-hover:text-purple-300 transition-colors">
                Tropical HR &amp; SDM
              </h3>
              <p className="text-xs text-gray-400">
                Absensi Face ID, jadwal shift kerja, pengajuan cuti &amp; istirahat, serta slip gaji.
              </p>
            </Link>

            <Link
              to="/operations"
              className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-pink-500/50 hover:bg-[#283049]/60 transition-all space-y-2 group block"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-pink-500/10 text-pink-400 group-hover:scale-105 transition-transform">
                  <Utensils className="w-5 h-5" />
                </span>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-pink-300 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-gray-100 group-hover:text-pink-300 transition-colors">
                Operations &amp; Gudang
              </h3>
              <p className="text-xs text-gray-400">
                Checklist 4 stasiun, purchasing supplier, stok bahan baku &amp; pencatatan wasting.
              </p>
            </Link>

            <Link
              to="/crm"
              className="p-5 rounded-2xl bg-[#1E2438] border border-[#2D374E] hover:border-emerald-500/50 hover:bg-[#283049]/60 transition-all space-y-2 group block"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </span>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-300 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-gray-100 group-hover:text-emerald-300 transition-colors">
                CRM &amp; WhatsApp Gateway
              </h3>
              <p className="text-xs text-gray-400">
                Database loyalitas pelanggan, reservasi meja VIP, pipeline prospek dan broadcast.
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
