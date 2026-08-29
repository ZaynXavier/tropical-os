import React, { useState, useEffect } from "react";
import { User, EmployeeKpiAssignment, KpiIndicatorResult } from "../../types";
import {
  KpiAnalyticsService,
  PerformanceSummary,
  DivisionPerformance,
  CompanyPerformance,
  TopPerformerItem,
  NeedsImprovementItem,
  IndicatorAnalyticsItem
} from "../../lib/supabase";
import {
  Award,
  Calendar,
  Layers,
  TrendingUp,
  Users,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  BarChart3,
  ListFilter,
  CheckCircle2,
  HelpCircle,
  Clock,
  MapPin,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface KpiPerformanceDashboardViewProps {
  user: User;
}

export const KpiPerformanceDashboardView: React.FC<KpiPerformanceDashboardViewProps> = ({ user }) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"personal" | "department" | "improvement" | "indicators">("personal");

  // Filters
  const [periods, setPeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");

  // State data
  const [personalHistory, setPersonalHistory] = useState<EmployeeKpiAssignment[]>([]);
  const [personalSummary, setPersonalSummary] = useState<PerformanceSummary | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<EmployeeKpiAssignment | null>(null);
  
  const [divisionAnalytics, setDivisionAnalytics] = useState<DivisionPerformance[]>([]);
  const [companyAnalytics, setCompanyAnalytics] = useState<CompanyPerformance | null>(null);
  const [topPerformers, setTopPerformers] = useState<TopPerformerItem[]>([]);
  const [needsImprovement, setNeedsImprovement] = useState<NeedsImprovementItem[]>([]);
  const [indicatorAnalytics, setIndicatorAnalytics] = useState<IndicatorAnalyticsItem[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLineageId, setExpandedLineageId] = useState<string | null>(null);

  const canViewAnalytics = user.role === "MANAGER" || user.role === "SUPERVISOR";
  const isManager = user.role === "MANAGER";

  // Load available periods on mount
  useEffect(() => {
    const initPeriods = async () => {
      const res = await KpiAnalyticsService.getAvailablePerformancePeriods();
      if (res.data && res.data.length > 0) {
        setPeriods(res.data);
        setSelectedPeriod(res.data[0]); // Default to latest period
      } else {
        // Fallback or empty state
        setPeriods([]);
      }
    };
    initPeriods();
  }, []);

  // Main loader based on filters & active tab
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Load Personal Performance (available for all authenticated users)
        const personalRes = await KpiAnalyticsService.getEmployeePerformanceHistory();
        if (personalRes.error) {
          setError(personalRes.error);
        } else {
          const list = personalRes.data || [];
          setPersonalHistory(list);
          if (list.length > 0) {
            // Default select the latest assignment for detail view
            setSelectedAssignment(list[list.length - 1]);
          }
        }

        const summaryRes = await KpiAnalyticsService.getEmployeePerformanceSummary();
        if (summaryRes.data) {
          setPersonalSummary(summaryRes.data);
        }

        // 2. Load Manager/Supervisor analytics
        if (canViewAnalytics) {
          const divFilter = isManager ? selectedDivision : user.division;
          const analyticsFilters = { period: selectedPeriod, division: divFilter };

          const [divRes, topRes, impRes, indRes] = await Promise.all([
            KpiAnalyticsService.getDivisionPerformanceAnalytics(analyticsFilters),
            KpiAnalyticsService.getTopPerformers({ ...analyticsFilters, limit: 5 }),
            KpiAnalyticsService.getNeedsImprovementEmployees(analyticsFilters),
            KpiAnalyticsService.getIndicatorPerformanceAnalytics(analyticsFilters)
          ]);

          if (divRes.error) setError(divRes.error);
          setDivisionAnalytics(divRes.data || []);
          setTopPerformers(topRes.data || []);
          setNeedsImprovement(impRes.data || []);
          setIndicatorAnalytics(indRes.data || []);

          if (isManager) {
            const compRes = await KpiAnalyticsService.getCompanyPerformanceAnalytics({ period: selectedPeriod });
            setCompanyAnalytics(compRes.data);
          }
        }
      } catch (e: any) {
        setError(e?.message || "Terjadi kesalahan saat memuat dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedPeriod, selectedDivision, activeTab, user]);

  const toggleLineage = (indicatorId: string) => {
    if (expandedLineageId === indicatorId) {
      setExpandedLineageId(null);
    } else {
      setExpandedLineageId(indicatorId);
    }
  };

  // Helper to render automated metrics breakdown
  const renderLineageTrace = (ind: KpiIndicatorResult) => {
    const metadata = ind.source_metadata;
    if (!metadata || Object.keys(metadata).length === 0) {
      return (
        <div className="p-3 bg-slate-950/60 rounded-lg text-slate-400 mt-2 text-xs border border-slate-800">
          Tidak ada metadata lineage untuk indikator manual.
        </div>
      );
    }

    const type = ind.source_data_type;

    if (type.includes("CHECKLIST")) {
      return (
        <div className="p-3.5 bg-slate-950/80 rounded-xl mt-2 space-y-2 border border-slate-850 text-xs">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              SOP/Checklist Lineage Trace
            </span>
            <span className="text-[10px] font-mono text-slate-500">Source: Checklist assignments</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Rasio Kepatuhan</p>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{metadata.compliance_rate}%</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Rata-rata Skor Kualitas</p>
              <p className="text-base font-bold text-cyan-400 mt-0.5">{metadata.average_quality_score || 0}/100</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Checklist Verified</p>
              <p className="text-slate-300 font-semibold mt-0.5">{metadata.verified_checklists} / {metadata.total_relevant_checklists}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Formula / Formula Logic</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Verified / Relevant * 100%</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
            <span>
              Ingested on <strong>{new Date(metadata.ingested_at || metadata.calculation_time || Date.now()).toLocaleDateString("id-ID")}</strong>. 
              SOP checklist source template ID: <code className="bg-slate-900 px-1 py-0.5 rounded font-mono text-slate-300 text-[9px]">{metadata.checklist_template_id || "N/A"}</code>
            </span>
          </div>
        </div>
      );
    }

    if (type.includes("ATTENDANCE")) {
      const isPresence = type.includes("PRESENCE") || type.includes("RATE");
      return (
        <div className="p-3.5 bg-slate-950/80 rounded-xl mt-2 space-y-2 border border-slate-850 text-xs">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Sistem Absensi Lineage Trace
            </span>
            <span className="text-[10px] font-mono text-slate-500">Source: Geofence Attendance DB</span>
          </div>
          {isPresence ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Rasio Kehadiran</p>
                <p className="text-base font-bold text-amber-400 mt-0.5">{metadata.presence_rate}%</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Hari Kerja Efektif</p>
                <p className="text-slate-300 font-semibold mt-0.5">{metadata.present_days} / {metadata.total_eligible_days} Hari</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Izin / Cuti Terhitung</p>
                <p className="text-slate-300 font-semibold mt-0.5">{metadata.leave_days || 0} Hari</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Ketidakhadiran (Absent)</p>
                <p className="text-rose-400 font-bold mt-0.5">{metadata.absent_days || 0} Hari</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Rasio Ketepatan Waktu</p>
                <p className="text-base font-bold text-emerald-400 mt-0.5">{metadata.punctuality_rate}%</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Total Keterlambatan</p>
                <p className="text-rose-400 font-bold mt-0.5">{metadata.late_count || 0} Kali</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Total Menit Terlambat</p>
                <p className="text-amber-500 font-semibold mt-0.5">{metadata.total_late_minutes || 0} Menit</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Toleransi Terlambat</p>
                <p className="text-slate-400 font-mono mt-0.5">Maks 15 Menit</p>
              </div>
            </div>
          )}
          <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
            <span>
              Ingested on <strong>{new Date(metadata.ingested_at || metadata.calculation_time || Date.now()).toLocaleDateString("id-ID")}</strong>. 
              Sistem menghitung performa ini secara otomatis tanpa bias penilaian manual.
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="p-3 bg-slate-950/60 rounded-lg text-slate-400 mt-2 text-xs border border-slate-800">
        <pre className="text-[10px] overflow-auto whitespace-pre-wrap">{JSON.stringify(metadata, null, 2)}</pre>
      </div>
    );
  };

  // Pie chart cell colors
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  const formatGradeData = (dist: { A: number; B: number; C: number; D: number }) => {
    return [
      { name: "Grade A", value: dist.A },
      { name: "Grade B", value: dist.B },
      { name: "Grade C", value: dist.C },
      { name: "Grade D", value: dist.D }
    ].filter(item => item.value > 0);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Filters bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Filter Analitik</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {periods.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
              >
                {periods.map((p) => (
                  <option key={p} value={p} className="bg-slate-950">
                    Periode {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          {canViewAnalytics && isManager && (
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-950">Semua Divisi</option>
                <option value="KITCHEN" className="bg-slate-950">Kitchen</option>
                <option value="BARISTA" className="bg-slate-950">Barista</option>
                <option value="SERVICE" className="bg-slate-950">Service</option>
                <option value="CASHIER" className="bg-slate-950">Cashier</option>
                <option value="MANAGEMENT" className="bg-slate-950">Management</option>
              </select>
            </div>
          )}

          {canViewAnalytics && !isManager && (
            <div className="bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Divisi: {user.division}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Inside Dashboard */}
      <div className="flex items-center gap-2 border-b border-slate-850 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "personal"
              ? "bg-slate-800 border border-slate-700 text-slate-200 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Histori Performa Saya
        </button>

        {canViewAnalytics && (
          <>
            <button
              onClick={() => setActiveTab("department")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "department"
                  ? "bg-slate-800 border border-slate-700 text-slate-200 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Analitik Divisi &amp; Komparasi
            </button>

            <button
              onClick={() => setActiveTab("improvement")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "improvement"
                  ? "bg-slate-800 border border-slate-700 text-slate-200 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Needs Improvement Tracker
            </button>

            <button
              onClick={() => setActiveTab("indicators")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "indicators"
                  ? "bg-slate-800 border border-slate-700 text-slate-200 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Analitik Indikator &amp; Bottleneck
            </button>
          </>
        )}
      </div>

      {/* Main loading screen */}
      {loading ? (
        <div className="p-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-semibold">Memproses snapshot database...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-xl bg-rose-950/20 border border-rose-900 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h4 className="text-sm font-bold text-rose-300">Gagal Memuat Data</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
        </div>
      ) : (
        <>
          {/* TAB 1: PERSONAL PERFORMANCE */}
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Personal Score Summary & Historical Line */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Skor KPI Saat Ini</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-emerald-400">
                        {personalSummary?.currentScore ? personalSummary.currentScore.toFixed(1) : "—"}
                      </span>
                      <span className="text-[10px] text-slate-400">/ 100</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Periode: {personalSummary?.period || "—"}</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Grade</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-cyan-400">
                        {personalSummary?.currentGrade || "—"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Terhitung permanen</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Skor Sebelumnya</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-300">
                        {personalSummary?.previousScore ? personalSummary.previousScore.toFixed(1) : "—"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Periode sebelumnya</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Perubahan (Delta)</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {personalSummary?.scoreDelta !== null && personalSummary!.scoreDelta! !== undefined ? (
                        <>
                          {personalSummary!.scoreDelta! >= 0 ? (
                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900 px-2 py-0.5 rounded">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>+{personalSummary.scoreDelta}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-900 px-2 py-0.5 rounded">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>{personalSummary.scoreDelta}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-500 font-semibold">—</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Dibandingkan bulan lalu</span>
                  </div>
                </div>

                {/* Performance Line Chart */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Tren Performa Historis</h3>
                    <p className="text-[10px] text-slate-500">Histori nilai final KPI Anda berdasarkan rilis bulanan dari sistem</p>
                  </div>

                  {personalHistory.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs">
                      Belum memiliki histori evaluasi KPI yang finalized.
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={personalHistory}
                          margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
                            labelStyle={{ color: "#94a3b8" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#10b981"
                            strokeWidth={3}
                            activeDot={{ r: 8 }}
                            name="Skor Akhir KPI"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* History Timeline Lists */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Daftar Penilaian Final</h3>
                    <p className="text-[10px] text-slate-500">Pilih penilaian untuk melihat perincian indikator dan lineage data</p>
                  </div>

                  <div className="space-y-2">
                    {personalHistory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedAssignment(item)}
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          selectedAssignment?.id === item.id
                            ? "bg-emerald-950/30 border-emerald-800"
                            : "bg-slate-950/40 border-slate-850 hover:bg-slate-950/70"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg font-bold font-mono text-xs ${
                            item.grade === "A" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" :
                            item.grade === "B" ? "bg-cyan-950 text-cyan-400 border border-cyan-900" :
                            "bg-rose-950 text-rose-400 border border-rose-900"
                          }`}>
                            Grade {item.grade || "N/A"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">{item.template_title}</p>
                            <p className="text-[10px] text-slate-400">
                              Periode: {item.period} • Dikunci pada: {item.finalized_at ? new Date(item.finalized_at).toLocaleDateString("id-ID") : "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-slate-100">{item.score.toFixed(1)}</span>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Detailed KPI Score Breakdown & Data Lineage */}
              <div className="space-y-6">
                {selectedAssignment ? (
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {selectedAssignment.period} • FINALIZED
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {selectedAssignment.employee_emp_id}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-200 mt-1.5">{selectedAssignment.employee_name}</h3>
                      <p className="text-[10px] text-slate-500">{selectedAssignment.position} • {selectedAssignment.division}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300">Rincian Indikator Kinerja</h4>
                      
                      <div className="space-y-2">
                        {selectedAssignment.indicator_results?.map((ind) => {
                          const hasLineage = ind.source_metadata && Object.keys(ind.source_metadata).length > 0;
                          return (
                            <div key={ind.id} className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <p className="text-xs font-bold text-slate-200">{ind.indicator_name_snapshot}</p>
                                  <p className="text-[9px] text-slate-500">Bobot: {ind.weight}% • DataSource: {ind.data_source_type}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-emerald-400">{ind.score ? ind.score.toFixed(1) : "0.0"}</p>
                                  <p className="text-[9px] text-slate-500">Weighted: {ind.weighted_score ? ind.weighted_score.toFixed(1) : "0.0"}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-2 rounded-lg text-[10px] border border-slate-850/40">
                                <div>
                                  <span className="text-slate-500 text-[9px] uppercase block">Target</span>
                                  <span className="font-semibold text-slate-300">{ind.target_value}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-[9px] uppercase block">Aktual Ingested</span>
                                  <span className="font-bold text-emerald-400">{ind.actual_value || "0.0"}</span>
                                </div>
                              </div>

                              {hasLineage && (
                                <div className="pt-1.5 flex justify-end">
                                  <button
                                    onClick={() => toggleLineage(ind.id)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
                                  >
                                    <span>{expandedLineageId === ind.id ? "Sembunyikan Jalur Data" : "Lihat Jalur Data Lineage"}</span>
                                    {expandedLineageId === ind.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              )}

                              {expandedLineageId === ind.id && hasLineage && renderLineageTrace(ind)}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectedAssignment.notes && (
                      <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-slate-300 block">Evaluator Notes / Catatan</span>
                        <p className="text-slate-400 leading-relaxed text-[11px]">{selectedAssignment.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl text-center text-slate-500 text-xs">
                    Belum ada penilaian terpilih. Silakan rekap penugasan finalized di kolom kiri.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: DEPARTMENT ANALYTICS */}
          {activeTab === "department" && canViewAnalytics && (
            <div className="space-y-6">
              
              {/* Top Summary Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Active Employees */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Staf Aktif Divisi</span>
                    <h3 className="text-3xl font-black text-slate-100">
                      {isManager ? (companyAnalytics?.totalEmployees || 0) : (divisionAnalytics?.[0]?.employeeCount || 0)}
                    </h3>
                    <p className="text-[10px] text-slate-500">Karyawan berstatus active</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                {/* Finalized Employees Count */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">KPI Evaluated &amp; Lock</span>
                    <h3 className="text-3xl font-black text-cyan-400">
                      {isManager ? (companyAnalytics?.finalizedEmployeeCount || 0) : (divisionAnalytics?.[0]?.finalizedEmployeeCount || 0)}
                    </h3>
                    <p className="text-[10px] text-slate-500">KPI status FINALIZED bulan ini</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-cyan-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                {/* Average Score */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Rata-rata Skor Kinerja</span>
                    <h3 className="text-3xl font-black text-amber-400">
                      {isManager 
                        ? (companyAnalytics?.averageScore ? companyAnalytics.averageScore.toFixed(1) : "—")
                        : (divisionAnalytics?.[0]?.averageScore ? divisionAnalytics[0].averageScore.toFixed(1) : "—")
                      }
                    </h3>
                    <p className="text-[10px] text-slate-500">Skor rata-rata target tercapai</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-amber-400">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Analytics Visualization Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Division Comparisons Chart (Manager only) */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Perbandingan Performa Antar Divisi</h3>
                    <p className="text-[10px] text-slate-500">Rata-rata skor final KPI di setiap divisi operasional outlet</p>
                  </div>

                  {divisionAnalytics.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs">
                      Tidak ada data divisi untuk periode terpilih.
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={divisionAnalytics}
                          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="division" stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[50, 100]} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
                            labelStyle={{ color: "#94a3b8" }}
                          />
                          <Bar dataKey="averageScore" name="Rata-rata Skor" fill="#10b981" radius={[4, 4, 0, 0]}>
                            {divisionAnalytics.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Grade Distribution Chart */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Distribusi Kategori Grade</h3>
                    <p className="text-[10px] text-slate-500">Persentase sebaran grade A, B, C, dan D</p>
                  </div>

                  {(() => {
                    const dist = isManager 
                      ? companyAnalytics?.gradeDistribution 
                      : divisionAnalytics?.[0]?.gradeDistribution;

                    if (!dist || (dist.A === 0 && dist.B === 0 && dist.C === 0 && dist.D === 0)) {
                      return (
                        <div className="p-12 text-center text-slate-500 text-xs">
                          Belum ada data distribusi grade.
                        </div>
                      );
                    }

                    const chartData = formatGradeData(dist);

                    return (
                      <div className="space-y-4">
                        <div className="h-44 w-full flex justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={60}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-300">
                          {chartData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                              <span>{entry.name}: <strong className="text-slate-100">{entry.value} Staf</strong></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Top Performers Grid Board */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Papan Peringkat Kinerja Terbaik (Top Performers)</h3>
                    <p className="text-[10px] text-slate-500">5 karyawan dengan pencapaian target kerja tertinggi pada periode {selectedPeriod}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-emerald-950 text-emerald-400 border border-emerald-900">
                    Sistem Urutan Skor Stabil
                  </span>
                </div>

                {topPerformers.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    Tidak ditemukan data performa terbaik pada periode ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                          <th className="py-2.5 pl-3">Rank</th>
                          <th className="py-2.5">Karyawan</th>
                          <th className="py-2.5">ID Karyawan</th>
                          <th className="py-2.5">Divisi</th>
                          <th className="py-2.5">Jabatan</th>
                          <th className="py-2.5">Skor Final</th>
                          <th className="py-2.5 pr-3 text-right">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/50">
                        {topPerformers.map((staf, index) => (
                          <tr key={staf.id} className="hover:bg-slate-850/40 transition-colors">
                            <td className="py-3 pl-3 font-bold font-mono">
                              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
                                index === 0 ? "bg-amber-950 text-amber-400 border border-amber-900" :
                                index === 1 ? "bg-slate-800 text-slate-300 border border-slate-700" :
                                index === 2 ? "bg-yellow-950 text-amber-600 border border-yellow-900" :
                                "bg-slate-900 text-slate-500 border border-slate-850"
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 font-bold text-slate-200">{staf.employee_name}</td>
                            <td className="py-3 text-slate-400 font-mono">{staf.emp_id}</td>
                            <td className="py-3 text-slate-400">{staf.division}</td>
                            <td className="py-3 text-slate-400">{staf.position}</td>
                            <td className="py-3 font-black text-emerald-400 font-mono">{(staf.score ?? 0).toFixed(1)}</td>
                            <td className="py-3 pr-3 text-right font-black">
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px]">
                                {staf.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: NEEDS IMPROVEMENT TRACKER */}
          {activeTab === "improvement" && canViewAnalytics && (
            <div className="space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="pb-3 border-b border-slate-850">
                  <h3 className="text-sm font-bold text-slate-200">Daftar Pemulihan Performa Staf (Needs Improvement)</h3>
                  <p className="text-[10px] text-slate-500">
                    Daftar karyawan yang memiliki pencapaian KPI di bawah standar minimum (Grade C, D atau Skor &lt; 70).
                    Tujuan modul ini adalah membantu Supervisor/Manager melakukan identifikasi dini guna membimbing staf tersebut secara objektif.
                  </p>
                </div>

                {needsImprovement.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 text-xs space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="font-bold text-slate-300">Semua Staf Memenuhi Standar Kepatuhan!</p>
                    <p className="text-[10px] text-slate-500 max-w-sm mx-auto">Tidak ada karyawan ber-grade C atau D pada periode {selectedPeriod}. Kinerja tim Anda berada dalam kondisi prima.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                          <th className="py-2.5 pl-3">Karyawan</th>
                          <th className="py-2.5">ID Karyawan</th>
                          <th className="py-2.5">Divisi</th>
                          <th className="py-2.5">Total Skor KPI</th>
                          <th className="py-2.5">Grade</th>
                          <th className="py-2.5">Indikator Terendah (Bottleneck)</th>
                          <th className="py-2.5 pr-3 text-right">Skor Indikator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/40">
                        {needsImprovement.map((staf) => (
                          <tr key={staf.id} className="hover:bg-slate-850/30 transition-colors">
                            <td className="py-3 pl-3 font-bold text-slate-200">{staf.employee_name}</td>
                            <td className="py-3 text-slate-400 font-mono">{staf.emp_id}</td>
                            <td className="py-3 text-slate-400">{staf.division}</td>
                            <td className="py-3 font-bold text-slate-200 font-mono">{(staf.score ?? 0).toFixed(1)}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                                staf.grade === "C" ? "bg-amber-950 text-amber-500 border border-amber-900" :
                                "bg-rose-950 text-rose-500 border border-rose-900"
                              }`}>
                                Grade {staf.grade}
                              </span>
                            </td>
                            <td className="py-3 text-rose-400 font-semibold">{staf.lowestIndicatorName || "N/A"}</td>
                            <td className="py-3 pr-3 text-right font-bold text-rose-400 font-mono">{staf.lowestIndicatorScore || "0.0"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Objective Coaching Guidance Card */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-3.5">
                <div className="p-3 bg-indigo-950/50 border border-indigo-900 rounded-lg text-indigo-400 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <h4 className="font-bold text-slate-200">Panduan Objektivitas Coaching &amp; Training</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Dengan melihat indikator terendah (bottleneck) di atas, Anda tidak perlu menebak atau berspekulasi mengapa staf memiliki kinerja rendah. 
                    Gunakan metric di atas sebagai bahan diskusi yang objektif dalam sesi bimbingan mingguan (one-on-one) serta menyusun rencana pelatihan (training) yang spesifik untuk area yang terhambat.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: INDICATORS PERFORMANCE & SYSTEMIC BOTTLENECKS */}
          {activeTab === "indicators" && canViewAnalytics && (
            <div className="space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="pb-3 border-b border-slate-850">
                  <h3 className="text-sm font-bold text-slate-200">Analisis Kinerja Indikator &amp; Hambatan Sistemik</h3>
                  <p className="text-[10px] text-slate-500">
                    Peta sebaran rata-rata skor indikator dari seluruh karyawan yang di-evaluate. 
                    Urutan teratas menunjukkan indikator dengan pencapaian terendah di outlet, yang berpotensi merupakan bottleneck operasional sistemik.
                  </p>
                </div>

                {indicatorAnalytics.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    Tidak ada indikator penyerapan data pada periode ini.
                  </div>
                ) : (
                  <div className="space-y-4">
                    
                    {/* Progress Bar Lists for all indicators */}
                    <div className="space-y-3">
                      {indicatorAnalytics.map((ind, index) => {
                        const score = ind.averageScore ?? 0;
                        const barColor = score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-cyan-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500";
                        return (
                          <div key={index} className="p-3.5 bg-slate-950/40 border border-slate-850/60 rounded-xl space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div>
                                <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                                  {index === 0 && <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase bg-rose-950 text-rose-400 border border-rose-900 animate-pulse">Critical</span>}
                                  {ind.indicatorName}
                                </h4>
                                <span className="text-[10px] text-slate-500">Rasio bobot template: {ind.weight}% • Dievaluasi pada: {ind.employeeCount} Karyawan</span>
                              </div>
                              <div className="flex items-baseline gap-2 text-right">
                                <span className="text-[10px] text-slate-400">Rata-rata Skor:</span>
                                <span className="text-sm font-black text-slate-100 font-mono">{score.toFixed(1)}</span>
                                <span className="text-[10px] text-slate-400">/ 100</span>
                              </div>
                            </div>

                            {/* Outer progress bar */}
                            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                              <div className={`h-full ${barColor} rounded-full`} style={{ width: `${score}%` }}></div>
                            </div>

                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Pencapaian Target: {(ind.averageAchievement ?? 0).toFixed(1)}%</span>
                              <span>Target: 100.0</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-3.5">
                <div className="p-3 bg-amber-950/50 border border-amber-900 rounded-lg text-amber-500 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <h4 className="font-bold text-slate-200">Mengapa Hambatan Sistemik Penting Ditangani?</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Jika suatu indikator (misalnya "Kecepatan Sajian") memiliki rata-rata skor yang rendah secara kolektif di seluruh divisi, masalahnya kemungkinan besar bukan terletak pada kemalasan staf individu, melainkan masalah sistemik pada mesin dapur, alur supply chain, atau standardisasi SOP yang kurang optimal.
                  </p>
                </div>
              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
};
