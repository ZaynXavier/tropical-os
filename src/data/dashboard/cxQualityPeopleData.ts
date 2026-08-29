import { CustomerExperienceData, QualityPeopleData, DashboardPeriod } from './types';

const emptyCXData: CustomerExperienceData = {
  googleRating: 5.0,
  totalGoogleReviews: 0,
  newReviewsThisMonth: 0,
  npsScore: 100,
  averageTableWaitTimeMin: 0,
  averageServingSpeedMin: 0,
  totalComplaintsCount: 0,
  totalVoidAmountRp: 0,
  totalRefundAmountRp: 0,
  voidTransactionCount: 0,
  complaintBreakdown: [],
  recentFeedback: [],
  diagnosticInsights: [],
};

export const mockCustomerExperienceData: Record<DashboardPeriod, CustomerExperienceData> = {
  month: emptyCXData,
  week: emptyCXData,
  today: emptyCXData,
  custom: emptyCXData,
};

const emptyQualityPeopleData: QualityPeopleData = {
  foodSafetyAuditScore: 100,
  hygieneSanitationScore: 100,
  mysteryShopperScore: 100,
  internalAuditScore: 100,
  serviceQualityScore: 100,
  overallAuditRating: 'EXCELLENT',
  trainingHoursTotal: 0,
  coachingSessionsCompleted: 0,
  disciplinaryCasesCount: 0,
  promotionsCount: 0,
  recruitmentInProgress: 0,
  resignationsCount: 0,
  turnoverRatePct: 0,
  criticalQualityCheckpoints: [],
};

export const mockQualityPeopleData: Record<DashboardPeriod, QualityPeopleData> = {
  month: emptyQualityPeopleData,
  week: emptyQualityPeopleData,
  today: emptyQualityPeopleData,
  custom: emptyQualityPeopleData,
};
