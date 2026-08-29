export interface PerformanceSummary {
  averageKpi: number;
  completedTasks: number;
  pendingTasks: number;
}
export interface DivisionPerformance {
  division: string;
  score: number;
}
export interface CompanyPerformance {
  overallScore: number;
  targetScore: number;
}
export interface TopPerformerItem {
  id: string;
  name: string;
  score: number;
}
export interface NeedsImprovementItem {
  id: string;
  name: string;
  score: number;
}
export interface IndicatorAnalyticsItem {
  id: string;
  indicatorName: string;
  averageScore: number;
}

export const KpiAnalyticsService = {
  async getDashboardMetrics() {
    return {
      data: {
        averageKpi: 88,
        topPerformers: [],
        departmentComparison: []
      },
      error: null
    };
  },
  async getTopPerformers(...args: any[]) {
    return { data: [], error: null };
  },
  async getNeedsImprovementEmployees(...args: any[]) {
    return { data: [], error: null };
  },
  async getIndicatorPerformanceAnalytics(...args: any[]) {
    return { data: [], error: null };
  },
  async getCompanyPerformanceAnalytics(...args: any[]) {
    return { data: { overallScore: 85, targetScore: 90 }, error: null };
  },
  async getAvailablePerformancePeriods(...args: any[]) {
    return { data: [], error: null };
  },
  async getEmployeePerformanceHistory(...args: any[]) {
    return { data: [], error: null };
  },
  async getEmployeePerformanceSummary(...args: any[]) {
    return { data: { averageKpi: 88, completedTasks: 0, pendingTasks: 0 }, error: null };
  },
  async getDivisionPerformanceAnalytics(...args: any[]) {
    return { data: [], error: null };
  }
};
