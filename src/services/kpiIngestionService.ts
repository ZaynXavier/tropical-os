export const KpiIngestionService = {
  async ingestData(data: any) {
    return { success: true, processedCount: 0 };
  },
  async refreshKpiMetrics(...args: any[]): Promise<{ success: boolean; data?: any; error?: string | null }> {
    return { success: true, data: { zero_data_indicators: 0, completed_indicators: 1, failed_indicators: 0 }, error: null };
  }
};
