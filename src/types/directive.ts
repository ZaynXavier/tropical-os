export type DirectivePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DirectiveCategory =
  | 'OPERATIONAL'
  | 'REVENUE_SALES'
  | 'CUSTOMER_SERVICE'
  | 'HR_PEOPLE'
  | 'FOOD_COST'
  | 'FACILITY_MAINTENANCE'
  | 'MARKETING_EVENT';

export type DirectiveStatus = 'NEW' | 'IN_PROGRESS' | 'WAITING_REVIEW' | 'COMPLETED';

export interface DirectiveProgressLog {
  id: string;
  authorName: string;
  authorRole: string;
  message: string;
  timestamp: string;
  progressPercentage?: number;
}

export interface OwnerDirective {
  id: string;
  code: string; // e.g. "DIR-0826-01"
  title: string;
  category: DirectiveCategory;
  priority: DirectivePriority;
  fromName: string;
  fromRole: string;
  targetName: string;
  targetRole: string;
  targetDate: string; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD HH:mm
  description: string;
  expectedOutcome: string;
  kpiTarget?: string;
  status: DirectiveStatus;
  progressPercentage: number;
  logs: DirectiveProgressLog[];
  ownerFeedback?: string;
  verifiedAt?: string;
}
