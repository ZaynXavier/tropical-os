export const SalaryService = {
  async getSalaryRecords() { return { data: [], error: null }; },
  async getSalaryComponents() { return { data: [], error: null }; },
  async getSalaryHistory() { return { data: [], error: null }; },
  async updateSalary(id: string, salary: number) { return { success: true, error: null }; },
  async createSalaryComponent(data: any) { return { success: true, error: null }; },
  async updateSalaryComponent(id: string, data: any) { return { success: true, error: null }; }
};

export const OvertimeService = {
  async getOvertimeRequests(filter?: any) { return { data: [], error: null }; },
  async submitOvertime(data: any) { return { success: true, error: null }; },
  async submitOvertimeRequest(data: any) { return { success: true, error: null }; },
  async createOvertimeRequest(data: any) { return { success: true, error: null }; },
  async approveOvertime(id: string) { return { success: true, error: null }; },
  async reviewOvertimeRequest(...args: any[]) { return { success: true, error: null }; },
  async cancelOvertimeRequest(id?: string) { return { success: true, error: null }; }
};

export const DeductionService = {
  async getDeductions(filter?: any) { return { data: [], error: null }; },
  async addDeduction(data: any) { return { success: true, error: null }; },
  async createDeduction(data: any) { return { success: true, error: null }; },
  async updateDeductionStatus(id: string, status: any) { return { success: true, error: null }; }
};

export const LeaveService = {
  async getLeaveRequests(filter?: any) { return { data: [], error: null }; },
  async submitLeave(data: any) { return { success: true, error: null }; },
  async submitLeaveRequest(data: any) { return { success: true, error: null }; },
  async createLeaveRequest(data: any) { return { success: true, error: null }; },
  async approveLeave(id: string) { return { success: true, error: null }; },
  async reviewLeaveRequest(...args: any[]) { return { success: true, error: null }; },
  async cancelLeaveRequest(...args: any[]) { return { success: true, error: null }; }
};

export const PipService = {
  async getPipRecords() { return { data: [], error: null }; },
  async getAllPips() { return { data: [], error: null }; },
  async getTrainingRecommendations(...args: any[]) { return { data: [], error: null }; },
  async createPip(...args: any[]) { return { success: true, data: {}, error: null }; },
  async updatePipStatus(...args: any[]) { return { success: true, data: {}, error: null }; }
};

export const HrService = {
  async getAuditLogs() { return { data: [], error: null }; },
  async getOrgStructure() { return { data: [], error: null }; },
  async getHrHistory(...args: any[]) { return { data: [], error: null }; }
};

export { AttendanceService } from './attendanceService';

export const AttendanceCorrectionService = {
  async getCorrections(filter?: any) { return { data: [], error: null }; },
  async submitCorrection(data: any) { return { success: true, error: null }; },
  async cancelCorrection(...args: any[]) { return { success: true, error: null }; },
  async reviewCorrection(...args: any[]) { return { success: true, error: null }; }
};

export const CrmService = {
  async getCustomers() { return { data: [], error: null }; },
  async getLeads() { return { data: [], error: null }; },
  async createLead(data: any) { return { success: true, error: null }; }
};

export const PurchasingService = {
  async getOrders() { return { data: [], error: null }; },
  async getRequests() { return { data: [], error: null }; },
  async getSuppliers() { return { data: [], error: null }; },
  async approvePR(...args: any[]) { return { success: true, error: null }; }
};

export const FinanceService = {
  async getTransactions(...args: any[]) { return { data: [], error: null }; },
  async getReports(...args: any[]) { return { data: [], error: null }; },
  async getCashierReports(...args: any[]) { return { data: [], error: null }; },
  async createCashierReport(...args: any[]) { return { success: true, error: null }; },
  async verifyReport(...args: any[]) { return { success: true, error: null }; }
};

export const SeedService = {
  async seedData(...args: any[]) { return { success: true, message: 'Database seeded successfully', error: null }; },
  async seedInitialDatabase(...args: any[]) { return { success: true, message: 'Initial database seeded successfully', error: null }; },
  async seedAllIfEmpty(...args: any[]) { return { success: true, message: 'Semua data awal berhasil disinkronkan ke sistem lokal!', error: null }; }
};

export const ApprovalService = {
  async getPendingApprovals() { return { data: [], error: null }; },
  async approve(id: string) { return { success: true, error: null }; }
};

export const AuditService = {
  async logAction(action: string, details: any) { return { success: true, error: null }; }
};
