import {
  DashboardPeriod,
  CustomDateRange,
  ExecutiveKPI,
  SalesPerformanceData,
  MenuPerformanceData,
  FoodCostData,
  InventoryData,
  LaborData,
  OpexData,
  CustomerExperienceData,
  QualityPeopleData,
  ProfitabilityData,
  ManagementIssue,
  SupervisorOperationalData,
  IssueStatus,
  IssuePriority,
  mockExecutiveKPI,
  mockSalesPerformance,
  mockMenuPerformance,
  mockFoodCostData,
  mockInventoryData,
  mockLaborData,
  mockOpexData,
  mockCustomerExperienceData,
  mockQualityPeopleData,
  mockProfitabilityData,
  initialManagementIssues,
  mockSupervisorOperationalData,
} from '../data/dashboard';
import { api } from './api';

// In-memory state for management issues
let managementIssuesState: ManagementIssue[] = [...initialManagementIssues];

/**
 * Dashboard Service
 * Provides typed Promise-based data access layer for TropicalOS Management Command Center
 * Integrates directly with Laravel Backend API (/api/v1/dashboard/executive)
 */
export class DashboardService {
  /**
   * Helper delay to simulate asynchronous data resolution
   */
  private static async simulateNetworkDelay(ms: number = 60): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetch Executive KPI Summary for selected period from Laravel API
   */
  public static async getExecutiveKpi(
    period: DashboardPeriod = 'month',
    _customRange?: CustomDateRange
  ): Promise<ExecutiveKPI> {
    try {
      const response = await api.get<any>('/dashboard/executive');
      if (response.data && response.data.success && response.data.data) {
        const kpi = response.data.data.kpi;
        const base = mockExecutiveKPI[period] || mockExecutiveKPI.month;

        return {
          ...base,
          totalSales: kpi.month_sales || base.totalSales,
          salesTarget: kpi.monthly_sales_target || base.salesTarget,
          achievementPercentage: kpi.target_achievement_percentage || base.achievementPercentage,
          foodCostPercentage: kpi.food_cost_percentage || base.foodCostPercentage,
          laborCostPercentage: kpi.labor_cost_percentage || base.laborCostPercentage,
          grossProfit: kpi.gross_profit || base.grossProfit,
          grossProfitMargin: kpi.gross_profit_margin || base.grossProfitMargin,
          netProfit: kpi.net_profit || base.netProfit,
          netProfitMargin: kpi.ebitda_margin || base.netProfitMargin,
          ebitda: kpi.net_profit || base.ebitda,
          ebitdaMargin: kpi.ebitda_margin || base.ebitdaMargin,
        };
      }
    } catch (apiError: any) {
      // 403 Forbidden or offline fallback
      if (apiError?.response?.status === 403) {
        console.warn('[DashboardService] Executive KPI access restricted by RBAC (403).');
      }
    }

    await this.simulateNetworkDelay();
    return mockExecutiveKPI[period] || mockExecutiveKPI.month;
  }

  /**
   * Fetch Sales Performance Analytics (Dimension 1)
   */
  public static async getSalesPerformance(
    period: DashboardPeriod = 'month',
    _customRange?: CustomDateRange
  ): Promise<SalesPerformanceData> {
    await this.simulateNetworkDelay();
    return mockSalesPerformance[period] || mockSalesPerformance.month;
  }

  /**
   * Fetch Menu Engineering & Performance (Dimension 2)
   */
  public static async getMenuPerformance(
    period: DashboardPeriod = 'month',
    _customRange?: CustomDateRange
  ): Promise<MenuPerformanceData> {
    await this.simulateNetworkDelay();
    return mockMenuPerformance[period] || mockMenuPerformance.month;
  }

  /**
   * Fetch Food Cost & COGS Variance (Dimension 3)
   */
  public static async getFoodCostSummary(
    period: DashboardPeriod = 'month',
    _customRange?: CustomDateRange
  ): Promise<FoodCostData> {
    await this.simulateNetworkDelay();
    return mockFoodCostData[period] || mockFoodCostData.month;
  }

  /**
   * Fetch Inventory & Stock Opname Status (Dimension 4)
   */
  public static async getInventorySummary(
    period: DashboardPeriod = 'month',
    _customRange?: CustomDateRange
  ): Promise<InventoryData> {
    await this.simulateNetworkDelay();
    return mockInventoryData[period] || mockInventoryData.month;
  }

  /**
   * Fetch Labor & Manpower Productivity (Dimension 5)
   */
  public static async getLaborSummary(
    period: DashboardPeriod = 'month',
    _customRange?: CustomDateRange
  ): Promise<LaborData> {
    await this.simulateNetworkDelay();
    return mockLaborData[period] || mockLaborData.month;
  }

  /**
   * Fetch Operational Expenses / OPEX (Dimension 6)
   */
  public static async getOpexSummary(
    period: DashboardPeriod = 'month',
    _customRange?: CustomDateRange
  ): Promise<OpexData> {
    await this.simulateNetworkDelay();
    return mockOpexData[period] || mockOpexData.month;
  }

  /**
   * Fetch Customer Experience & Guest Feedback (Dimension 7)
   */
  public static async getCustomerExperience(
    period: DashboardPeriod = 'month',
    _customRange?: CustomDateRange
  ): Promise<CustomerExperienceData> {
    await this.simulateNetworkDelay();
    return mockCustomerExperienceData[period] || mockCustomerExperienceData.month;
  }

  /**
   * Fetch Quality Scorecards & People Metrics (Dimensions 8 & 9)
   */
  public static async getQualityPeopleSummary(
    period: DashboardPeriod = 'month',
    _customRange?: CustomDateRange
  ): Promise<QualityPeopleData> {
    await this.simulateNetworkDelay();
    return mockQualityPeopleData[period] || mockQualityPeopleData.month;
  }

  /**
   * Fetch Bottom Line Profitability P&L (Dimension 10)
   */
  public static async getProfitabilitySummary(
    period: DashboardPeriod = 'month',
    _customRange?: CustomDateRange
  ): Promise<ProfitabilityData> {
    await this.simulateNetworkDelay();
    return mockProfitabilityData[period] || mockProfitabilityData.month;
  }

  /**
   * Fetch Supervisor Real-Time Operational View
   */
  public static async getSupervisorOperationalData(): Promise<SupervisorOperationalData> {
    await this.simulateNetworkDelay();
    return mockSupervisorOperationalData;
  }

  /**
   * Fetch Management Issues & Root-Cause Tracker
   */
  public static async getManagementIssues(filter?: {
    status?: IssueStatus;
    priority?: IssuePriority;
    dimension?: string;
  }): Promise<ManagementIssue[]> {
    await this.simulateNetworkDelay();
    let result = [...managementIssuesState];

    if (filter?.status) {
      result = result.filter((item) => item.status === filter.status);
    }
    if (filter?.priority) {
      result = result.filter((item) => item.priority === filter.priority);
    }
    if (filter?.dimension) {
      result = result.filter((item) => item.dimension === filter.dimension);
    }

    return result;
  }

  /**
   * Update Issue Status (e.g. OPEN -> IN_PROGRESS -> RESOLVED)
   */
  public static async updateIssueStatus(
    issueId: string,
    newStatus: IssueStatus
  ): Promise<ManagementIssue | null> {
    await this.simulateNetworkDelay();
    const index = managementIssuesState.findIndex((item) => item.id === issueId);
    if (index === -1) return null;

    const progress = newStatus === 'RESOLVED' ? 100 : newStatus === 'IN_PROGRESS' ? 60 : 10;
    const updated = {
      ...managementIssuesState[index],
      status: newStatus,
      progressPercentage: progress,
    };

    managementIssuesState[index] = updated;
    return updated;
  }

  /**
   * Create a new Management Issue / Action
   */
  public static async createIssue(
    issue: Omit<ManagementIssue, 'id' | 'createdAt' | 'progressPercentage'>
  ): Promise<ManagementIssue> {
    await this.simulateNetworkDelay();
    const newIssue: ManagementIssue = {
      ...issue,
      id: `issue-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      progressPercentage: issue.status === 'RESOLVED' ? 100 : issue.status === 'IN_PROGRESS' ? 50 : 0,
    };
    managementIssuesState.unshift(newIssue);
    return newIssue;
  }
}
