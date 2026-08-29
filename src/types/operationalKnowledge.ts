/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.9 — Operational Knowledge & Execution System
 * Types for SOP (Standard Operating Procedure), Job Description, 
 * IKA (Instruksi Kerja Alat), and Checklist Integration.
 */

export type DocumentWorkflowStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'ARCHIVED';

export type RestoDivision =
  | 'KITCHEN'
  | 'BARISTA'
  | 'SERVICE'
  | 'CASHIER'
  | 'CLEANING'
  | 'MANAGEMENT'
  | 'CRM'
  | 'FINANCE'
  | 'ALL';

// ============================================================================
// 1. SOP (STANDARD OPERATING PROCEDURE)
// ============================================================================

export type SopCategory =
  | 'HYGIENE_SANITASI'
  | 'FOOD_PREPARATION'
  | 'BEVERAGE_STANDARD'
  | 'GUEST_SERVICE'
  | 'CASHIER_POS'
  | 'SAFETY_K3'
  | 'INVENTORY_RECEIVING'
  | 'MANAGEMENT_ADMIN';

export interface SopStep {
  stepNumber: number;
  title: string;
  description: string;
  responsibleRole?: string;
  criticalPoint?: string; // Critical Control Point (CCP) / Safety Warning
  referenceIkaId?: string; // Link to specific IKA
}

export interface SopAcknowledgment {
  employeeId: string;
  employeeName: string;
  position: string;
  acknowledgedAt: string;
  notes?: string;
}

export interface SopRevisionHistory {
  version: string;
  revisedAt: string;
  revisedBy: string;
  changeSummary: string;
}

export interface SopDocument {
  id: string;
  code: string; // e.g. SOP-KIT-001
  title: string;
  division: RestoDivision;
  category: SopCategory;
  version: string;
  status: DocumentWorkflowStatus;
  effectiveDate: string;
  reviewDate?: string;
  authorName: string;
  approverName: string;
  purpose: string;
  scope: string;
  responsibilities: string[];
  definitions?: { term: string; meaning: string }[];
  steps: SopStep[];
  linkedJobDescriptionIds?: string[];
  linkedIkaIds?: string[];
  linkedChecklistTemplateIds?: string[];
  acknowledgments: SopAcknowledgment[];
  revisionHistory: SopRevisionHistory[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SopFilterParams {
  division?: RestoDivision | 'ALL';
  category?: SopCategory | 'ALL';
  status?: DocumentWorkflowStatus | 'ALL';
  searchQuery?: string;
}

// ============================================================================
// 2. JOB DESCRIPTION (URAIAN JABATAN)
// ============================================================================

export type JobGradeLevel =
  | 'EXECUTIVE'
  | 'MANAGEMENT'
  | 'SUPERVISOR'
  | 'SENIOR_STAFF'
  | 'STAFF'
  | 'HELPER';

export interface JobDutyItem {
  id: string;
  duty: string;
  frequency: 'DAILY_SHIFT' | 'WEEKLY' | 'MONTHLY' | 'INCIDENTAL';
  standardOutput?: string;
  relatedSopCode?: string;
}

export interface JobDescriptionDocument {
  id: string;
  positionCode: string; // e.g. JD-KIT-01
  positionTitle: string; // e.g. "Head Chef"
  department: string;
  division: RestoDivision;
  gradeLevel: JobGradeLevel;
  reportsToPosition: string;
  directSubordinates: string[];
  employmentType: 'PERMANENT' | 'CONTRACT' | 'PART_TIME';
  jobSummary: string;
  coreDuties: JobDutyItem[];
  keyPerformanceIndicators: {
    indicatorName: string;
    targetDescription: string;
    weightPercentage: number;
  }[];
  qualifications: {
    education: string;
    experience: string;
    certifications?: string[];
    skills: string[];
  };
  workConditions: {
    workHours: string;
    physicalDemands: string;
    safetyEquipmentRequired: string[];
  };
  linkedSopIds: string[];
  linkedIkaIds: string[];
  linkedChecklistTemplateIds: string[];
  version: string;
  effectiveDate: string;
  status: DocumentWorkflowStatus;
  authorName: string;
  approvedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobDescriptionFilterParams {
  division?: RestoDivision | 'ALL';
  gradeLevel?: JobGradeLevel | 'ALL';
  searchQuery?: string;
}

// ============================================================================
// 3. IKA (INSTRUKSI KERJA ALAT & TEKNIS)
// ============================================================================

export interface IkaStep {
  stepNumber: number;
  phase: 'BEFORE_USE' | 'OPERATION' | 'CLEANING_AFTER' | 'MAINTENANCE';
  title: string;
  instruction: string;
  safetyWarning?: string;
  cautionLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  photoUrl?: string;
}

export interface IkaTroubleshooting {
  problem: string;
  possibleCause: string;
  actionSolution: string;
  severity: 'EASY' | 'MODERATE' | 'CALL_TECHNICIAN';
}

export interface IkaDocument {
  id: string;
  code: string; // e.g. IKA-KIT-001
  title: string; // e.g. "Instruksi Kerja Pemakaian & Sanitasi Mesin Espresso La Marzocco"
  equipmentName: string;
  brandModel: string;
  locationStation: string;
  division: RestoDivision;
  parentSopId?: string;
  parentSopCode?: string;
  parentSopTitle?: string;
  safetyEquipment: string[]; // APD: Sarung tangan panas, celemek dll
  steps: IkaStep[];
  troubleshootingGuide: IkaTroubleshooting[];
  cleaningFrequency: 'AFTER_EACH_USE' | 'DAILY_CLOSING' | 'WEEKLY_DEEP_CLEAN' | 'MONTHLY';
  version: string;
  effectiveDate: string;
  status: DocumentWorkflowStatus;
  authorName: string;
  approverName: string;
  createdAt: string;
  updatedAt: string;
}

export interface IkaFilterParams {
  division?: RestoDivision | 'ALL';
  searchQuery?: string;
}
