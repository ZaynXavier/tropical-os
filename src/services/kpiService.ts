export const KpiService = {
  async getKpis(...args: any[]) { return { data: [], error: null }; },
  async getAssignments(...args: any[]) { return { data: [], error: null }; },
  async getKpiAssignments(...args: any[]) { return { data: [], error: null }; },
  async getKpiTemplates(...args: any[]) { return { data: [], error: null }; },
  async createKpiTemplate(...args: any[]) { return { success: true, data: {}, error: null }; },
  async getKpiAssignmentById(id: string) { return { data: null, error: null }; },
  async requestKpiRevision(id: string, ...args: any[]) { return { success: true, data: {}, error: null }; },
  async createKpiAssignment(...args: any[]) { return { success: true, data: {}, error: null }; },
  async updateIndicatorResult(...args: any[]) { return { success: true, data: {}, error: null }; },
  async startKpiAssignment(...args: any[]) { return { success: true, data: {}, error: null }; },
  async submitKpiAssignment(...args: any[]) { return { success: true, data: {}, error: null }; },
  async approveKpiAssignment(...args: any[]) { return { success: true, data: {}, error: null }; },
  async finalizeKpiAssignment(...args: any[]) { return { success: true, data: {}, error: null }; },
  async assignKpi(data: any) { return { success: true, error: null }; },
  async calculateScores() { return { success: true, error: null }; }
};
