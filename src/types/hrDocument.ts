/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — HR Documents & Employee Administration
 * Data types and interfaces for Employee Document Administration System
 */

export type HRDocumentStatus =
  | 'DRAFT'
  | 'UPLOADED'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'EXPIRING_SOON'
  | 'ARCHIVED';

export type DocumentRequirementType = 'REQUIRED' | 'OPTIONAL' | 'CONDITIONAL';

export type CompletenessStatus = 'COMPLETE' | 'PARTIAL' | 'INCOMPLETE' | 'NOT_APPLICABLE';

export type ExpirationFilterCategory =
  | 'ALL'
  | 'EXPIRED'
  | 'EXPIRING_7'
  | 'EXPIRING_14'
  | 'EXPIRING_30'
  | 'NO_EXPIRY'
  | 'ACTIVE';

export interface HRDocumentCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
  displayOrder: number;
  isSensitive?: boolean;
}

export interface HRDocumentType {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  description: string;
  defaultRequirementType: DocumentRequirementType;
  hasExpiry: boolean;
  defaultValidityMonths?: number;
  isSensitive?: boolean;
  allowedFileTypes: string[];
  maxFileSizeBytes?: number;
}

export interface HRDocument {
  id: string;
  employeeId: string;
  documentTypeId: string;
  documentCategoryId: string;
  documentName: string;
  documentNumber?: string;
  description?: string;
  
  // File Metadata (Frontend Mock - No binary data in localStorage)
  fileName: string;
  fileType: string;
  fileSize: number; // bytes
  filePath: string; // mock path
  
  issueDate?: string; // ISO format (YYYY-MM-DD)
  expiryDate?: string; // ISO format (YYYY-MM-DD)
  isRequired: boolean;
  status: HRDocumentStatus;
  
  // Versioning
  version: number;
  previousVersionId?: string;
  isArchived: boolean;
  
  // Audit Trail & Verification
  uploadedBy: string;
  uploadedAt: string;
  updatedBy?: string;
  updatedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  archivedBy?: string;
  archivedAt?: string;
  archiveReason?: string;
  
  notes?: string;
  tags?: string[];
}

export interface DocumentRequirement {
  id: string;
  documentTypeId: string;
  scopeType: 'ALL' | 'DEPARTMENT' | 'ROLE' | 'EMPLOYEE';
  departmentId?: string;
  roleId?: string;
  employeeId?: string;
  requirementType: DocumentRequirementType;
  isRequired: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  notes?: string;
}

export interface EmployeeMissingDocument {
  documentTypeId: string;
  documentTypeName: string;
  categoryId: string;
  categoryName: string;
  requirementType: DocumentRequirementType;
  reason?: string;
}

export interface EmployeeDocumentCompleteness {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  avatarUrl?: string;
  
  totalRequired: number;
  completedRequired: number;
  missingRequired: number;
  totalOptional: number;
  completedOptional: number;
  
  completenessPercentage: number;
  status: CompletenessStatus;
  
  missingDocuments: EmployeeMissingDocument[];
  expiringDocumentsCount: number;
  expiredDocumentsCount: number;
  pendingReviewCount: number;
  verifiedCount: number;
  
  lastUpdated?: string;
}

export interface DocumentComplianceSummary {
  totalEmployees: number;
  totalDocuments: number;
  completeEmployeesCount: number;
  incompleteEmployeesCount: number;
  partialEmployeesCount: number;
  
  expiringSoonCount: number;
  expiredCount: number;
  pendingReviewCount: number;
  verifiedCount: number;
  rejectedCount: number;
  
  complianceRate: number; // percentage of employees with 100% required documents completed
  categoryDistribution: {
    categoryId: string;
    categoryName: string;
    totalDocuments: number;
    verifiedCount: number;
  }[];
  
  attentionAlerts: {
    id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
    title: string;
    description: string;
    employeeId?: string;
    employeeName?: string;
    documentId?: string;
    targetSubView?: string;
  }[];
}

export interface HRDocumentFilterParams {
  employeeId?: string;
  department?: string;
  categoryId?: string;
  documentTypeId?: string;
  status?: HRDocumentStatus | 'ALL';
  expirationFilter?: ExpirationFilterCategory;
  completenessStatus?: CompletenessStatus | 'ALL';
  searchQuery?: string;
  showArchived?: boolean;
}
