/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — HR Documents Service
 * Comprehensive service layer for managing Employee HR Documents,
 * Expiration Monitoring, Completeness Tracking, and Audit Trails.
 */

import {
  HRDocument,
  HRDocumentCategory,
  HRDocumentType,
  DocumentRequirement,
  EmployeeDocumentCompleteness,
  DocumentComplianceSummary,
  HRDocumentFilterParams,
  HRDocumentStatus,
  ExpirationFilterCategory,
  EmployeeMissingDocument,
} from '../types/hrDocument';
import {
  INITIAL_HR_DOCUMENT_CATEGORIES,
  INITIAL_HR_DOCUMENT_TYPES,
  INITIAL_DOCUMENT_REQUIREMENTS,
  INITIAL_HR_DOCUMENTS,
} from '../data/mockHrDocuments';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { Employee } from '../types/employee';

const STORAGE_KEYS = {
  DOCUMENTS: 'tropicalos_master_hr_documents',
  CATEGORIES: 'tropicalos_master_hr_doc_categories',
  TYPES: 'tropicalos_master_hr_doc_types',
  REQUIREMENTS: 'tropicalos_master_hr_doc_requirements',
};

class HRDocumentService {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      return JSON.parse(stored) as T;
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // ==========================================
  // INITIALIZATION & RESETS
  // ==========================================
  public initializeDefaults(force = false): void {
    if (force || !localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.setStorage(STORAGE_KEYS.CATEGORIES, INITIAL_HR_DOCUMENT_CATEGORIES);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.TYPES)) {
      this.setStorage(STORAGE_KEYS.TYPES, INITIAL_HR_DOCUMENT_TYPES);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.REQUIREMENTS)) {
      this.setStorage(STORAGE_KEYS.REQUIREMENTS, INITIAL_DOCUMENT_REQUIREMENTS);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      this.setStorage(STORAGE_KEYS.DOCUMENTS, INITIAL_HR_DOCUMENTS);
    }
  }

  public resetToDefaults(): void {
    this.initializeDefaults(true);
  }

  // ==========================================
  // MASTER METADATA READERS
  // ==========================================
  public getCategories(): HRDocumentCategory[] {
    this.initializeDefaults();
    return this.getStorage(STORAGE_KEYS.CATEGORIES, INITIAL_HR_DOCUMENT_CATEGORIES);
  }

  public getCategoryById(id: string): HRDocumentCategory | undefined {
    return this.getCategories().find((c) => c.id === id);
  }

  public getDocumentTypes(): HRDocumentType[] {
    this.initializeDefaults();
    return this.getStorage(STORAGE_KEYS.TYPES, INITIAL_HR_DOCUMENT_TYPES);
  }

  public getDocumentTypeById(id: string): HRDocumentType | undefined {
    return this.getDocumentTypes().find((t) => t.id === id);
  }

  public getDocumentRequirements(): DocumentRequirement[] {
    this.initializeDefaults();
    return this.getStorage(STORAGE_KEYS.REQUIREMENTS, INITIAL_DOCUMENT_REQUIREMENTS);
  }

  // ==========================================
  // DOCUMENTS CRUD & FILTERS
  // ==========================================
  public getDocuments(filters?: HRDocumentFilterParams): HRDocument[] {
    this.initializeDefaults();
    let docs = this.getStorage<HRDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_HR_DOCUMENTS);

    // Auto update expired statuses based on current date
    const now = new Date();
    docs = docs.map((doc) => {
      if (doc.expiryDate && !doc.isArchived && doc.status !== 'REJECTED') {
        const exp = new Date(doc.expiryDate);
        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0 && doc.status !== 'EXPIRED') {
          return { ...doc, status: 'EXPIRED' as HRDocumentStatus };
        } else if (diffDays > 0 && diffDays <= 30 && doc.status === 'VERIFIED') {
          return { ...doc, status: 'EXPIRING_SOON' as HRDocumentStatus };
        }
      }
      return doc;
    });

    if (!filters) return docs;

    return docs.filter((doc) => {
      // Archive filter
      if (!filters.showArchived && doc.isArchived) return false;
      if (filters.showArchived === true && !doc.isArchived) return false;

      // Employee Filter
      if (filters.employeeId && doc.employeeId !== filters.employeeId) return false;

      // Category Filter
      if (filters.categoryId && doc.documentCategoryId !== filters.categoryId) return false;

      // Type Filter
      if (filters.documentTypeId && doc.documentTypeId !== filters.documentTypeId) return false;

      // Status Filter
      if (filters.status && filters.status !== 'ALL' && doc.status !== filters.status) return false;

      // Expiration Filter
      if (filters.expirationFilter && filters.expirationFilter !== 'ALL') {
        if (!this.matchesExpirationFilter(doc, filters.expirationFilter)) {
          return false;
        }
      }

      // Department Filter (look up employee)
      if (filters.department && filters.department !== 'ALL') {
        const emp = this.getEmployee(doc.employeeId);
        if (!emp || emp.department !== filters.department) return false;
      }

      // Search Query
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const emp = this.getEmployee(doc.employeeId);
        const empName = emp?.fullName?.toLowerCase() || emp?.name?.toLowerCase() || '';
        const matchTitle = doc.documentName.toLowerCase().includes(q);
        const matchNum = doc.documentNumber?.toLowerCase().includes(q) || false;
        const matchFileName = doc.fileName.toLowerCase().includes(q);
        const matchNotes = doc.notes?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchNum && !matchFileName && !matchNotes && !empName.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }

  public getDocumentById(id: string): HRDocument | undefined {
    return this.getDocuments({ showArchived: true }).find((d) => d.id === id);
  }

  public getDocumentsByEmployee(employeeId: string, includeArchived = false): HRDocument[] {
    return this.getDocuments({ employeeId, showArchived: includeArchived });
  }

  public getPendingDocuments(): HRDocument[] {
    return this.getDocuments().filter((d) => d.status === 'PENDING_REVIEW');
  }

  public getExpiredDocuments(): HRDocument[] {
    return this.getDocuments().filter((d) => d.status === 'EXPIRED');
  }

  public getExpiringSoonDocuments(days = 30): HRDocument[] {
    const now = new Date();
    return this.getDocuments().filter((d) => {
      if (!d.expiryDate || d.isArchived || d.status === 'EXPIRED') return false;
      const exp = new Date(d.expiryDate);
      const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 && diff <= days;
    });
  }

  // ==========================================
  // DOCUMENT ACTIONS & WORKFLOWS
  // ==========================================
  public createDocument(docData: Omit<HRDocument, 'id' | 'version' | 'isArchived' | 'uploadedAt'> & { uploadedAt?: string }): HRDocument {
    const allDocs = this.getStorage<HRDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_HR_DOCUMENTS);
    const newId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const newDoc: HRDocument = {
      ...docData,
      id: newId,
      version: 1,
      isArchived: false,
      uploadedAt: docData.uploadedAt || new Date().toISOString(),
    };

    allDocs.unshift(newDoc);
    this.setStorage(STORAGE_KEYS.DOCUMENTS, allDocs);
    return newDoc;
  }

  public updateDocument(id: string, updates: Partial<HRDocument>, updatedBy: string): HRDocument | null {
    const allDocs = this.getStorage<HRDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_HR_DOCUMENTS);
    const index = allDocs.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const updated: HRDocument = {
      ...allDocs[index],
      ...updates,
      updatedBy,
      updatedAt: new Date().toISOString(),
    };

    allDocs[index] = updated;
    this.setStorage(STORAGE_KEYS.DOCUMENTS, allDocs);
    return updated;
  }

  public submitForReview(id: string, submittedBy: string): HRDocument | null {
    return this.updateDocument(id, { status: 'PENDING_REVIEW' }, submittedBy);
  }

  public verifyDocument(id: string, verifiedBy: string, notes?: string): HRDocument | null {
    const allDocs = this.getStorage<HRDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_HR_DOCUMENTS);
    const index = allDocs.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const target = allDocs[index];
    const nowIso = new Date().toISOString();

    const updated: HRDocument = {
      ...target,
      status: 'VERIFIED',
      verifiedBy,
      verifiedAt: nowIso,
      rejectedBy: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
      notes: notes ? `${target.notes ? target.notes + ' | ' : ''}Verifikasi: ${notes}` : target.notes,
      updatedBy: verifiedBy,
      updatedAt: nowIso,
    };

    allDocs[index] = updated;
    this.setStorage(STORAGE_KEYS.DOCUMENTS, allDocs);
    return updated;
  }

  public rejectDocument(id: string, reason: string, rejectedBy: string): HRDocument | null {
    const allDocs = this.getStorage<HRDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_HR_DOCUMENTS);
    const index = allDocs.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const target = allDocs[index];
    const nowIso = new Date().toISOString();

    const updated: HRDocument = {
      ...target,
      status: 'REJECTED',
      rejectedBy,
      rejectedAt: nowIso,
      rejectionReason: reason,
      updatedBy: rejectedBy,
      updatedAt: nowIso,
    };

    allDocs[index] = updated;
    this.setStorage(STORAGE_KEYS.DOCUMENTS, allDocs);
    return updated;
  }

  public archiveDocument(id: string, reason: string, archivedBy: string): HRDocument | null {
    const allDocs = this.getStorage<HRDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_HR_DOCUMENTS);
    const index = allDocs.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const target = allDocs[index];
    const nowIso = new Date().toISOString();

    const updated: HRDocument = {
      ...target,
      status: 'ARCHIVED',
      isArchived: true,
      archivedBy,
      archivedAt: nowIso,
      archiveReason: reason,
      updatedBy: archivedBy,
      updatedAt: nowIso,
    };

    allDocs[index] = updated;
    this.setStorage(STORAGE_KEYS.DOCUMENTS, allDocs);
    return updated;
  }

  public createNewVersion(
    previousDocId: string,
    newData: Partial<Omit<HRDocument, 'id' | 'version' | 'previousVersionId' | 'isArchived'>>,
    createdBy: string
  ): HRDocument | null {
    const allDocs = this.getStorage<HRDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_HR_DOCUMENTS);
    const oldIndex = allDocs.findIndex((d) => d.id === previousDocId);
    if (oldIndex === -1) return null;

    const oldDoc = allDocs[oldIndex];
    const nowIso = new Date().toISOString();

    // 1. Archive previous version
    const archivedOldDoc: HRDocument = {
      ...oldDoc,
      isArchived: true,
      status: 'ARCHIVED',
      archivedBy: createdBy,
      archivedAt: nowIso,
      archiveReason: `Digantikan oleh versi baru ${oldDoc.version + 1}.`,
    };
    allDocs[oldIndex] = archivedOldDoc;

    // 2. Create new active version
    const newDocId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newVersionDoc: HRDocument = {
      ...oldDoc,
      ...newData,
      id: newDocId,
      version: oldDoc.version + 1,
      previousVersionId: oldDoc.id,
      isArchived: false,
      status: newData.status || 'PENDING_REVIEW',
      uploadedBy: createdBy,
      uploadedAt: nowIso,
      updatedBy: undefined,
      updatedAt: undefined,
      verifiedBy: undefined,
      verifiedAt: undefined,
      rejectedBy: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
      archivedBy: undefined,
      archivedAt: undefined,
      archiveReason: undefined,
    };

    allDocs.unshift(newVersionDoc);
    this.setStorage(STORAGE_KEYS.DOCUMENTS, allDocs);
    return newVersionDoc;
  }

  public getDocumentVersions(documentId: string): HRDocument[] {
    const allDocs = this.getStorage<HRDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_HR_DOCUMENTS);
    const target = allDocs.find((d) => d.id === documentId);
    if (!target) return [];

    // Traverse root version
    const lineageIds = new Set<string>();
    lineageIds.add(target.id);
    if (target.previousVersionId) lineageIds.add(target.previousVersionId);

    allDocs.forEach((d) => {
      if (d.previousVersionId === target.id || (target.previousVersionId && d.previousVersionId === target.previousVersionId)) {
        lineageIds.add(d.id);
      }
    });

    return allDocs.filter((d) => lineageIds.has(d.id)).sort((a, b) => b.version - a.version);
  }

  public deleteDocument(id: string): boolean {
    const allDocs = this.getStorage<HRDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_HR_DOCUMENTS);
    const filtered = allDocs.filter((d) => d.id !== id);
    if (filtered.length === allDocs.length) return false;
    this.setStorage(STORAGE_KEYS.DOCUMENTS, filtered);
    return true;
  }

  // ==========================================
  // COMPLETENESS & COMPLIANCE CALCULATIONS
  // ==========================================
  public getEmployeeDocumentCompleteness(employeeId: string): EmployeeDocumentCompleteness {
    const employee = this.getEmployee(employeeId);
    const empDocs = this.getDocumentsByEmployee(employeeId, false); // active only
    const requirements = this.getDocumentRequirements();
    const docTypes = this.getDocumentTypes();
    const categories = this.getCategories();

    // Required types for this employee
    const requiredTypes = requirements.filter(
      (r) => r.requirementType === 'REQUIRED' && (r.scopeType === 'ALL' || r.employeeId === employeeId)
    );

    const missingDocuments: EmployeeMissingDocument[] = [];
    let completedRequired = 0;

    requiredTypes.forEach((req) => {
      const type = docTypes.find((t) => t.id === req.documentTypeId);
      const cat = categories.find((c) => c.id === type?.categoryId);

      // Check if employee has a verified or uploaded document for this type
      const hasDoc = empDocs.some(
        (d) => d.documentTypeId === req.documentTypeId && (d.status === 'VERIFIED' || d.status === 'EXPIRING_SOON' || d.status === 'UPLOADED' || d.status === 'PENDING_REVIEW')
      );

      if (hasDoc) {
        completedRequired++;
      } else {
        missingDocuments.push({
          documentTypeId: req.documentTypeId,
          documentTypeName: type?.name || 'Dokumen Wajib',
          categoryId: type?.categoryId || '',
          categoryName: cat?.name || 'Umum',
          requirementType: 'REQUIRED',
          reason: 'Belum diunggah ke sistem',
        });
      }
    });

    const totalRequired = requiredTypes.length;
    const completenessPercentage = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 100;

    let status: 'COMPLETE' | 'PARTIAL' | 'INCOMPLETE' = 'INCOMPLETE';
    if (completenessPercentage === 100) {
      status = 'COMPLETE';
    } else if (completenessPercentage >= 50) {
      status = 'PARTIAL';
    }

    const expiringCount = empDocs.filter((d) => d.status === 'EXPIRING_SOON').length;
    const expiredCount = empDocs.filter((d) => d.status === 'EXPIRED').length;
    const pendingCount = empDocs.filter((d) => d.status === 'PENDING_REVIEW').length;
    const verifiedCount = empDocs.filter((d) => d.status === 'VERIFIED').length;

    return {
      employeeId,
      employeeCode: employee?.employeeCode || employee?.employeeNo || employeeId,
      employeeName: employee?.fullName || employee?.name || 'Karyawan',
      department: employee?.department || 'Operasional',
      position: employee?.primaryPosition || employee?.role || 'Staff',
      avatarUrl: (employee as any)?.avatarUrl || '',
      totalRequired,
      completedRequired,
      missingRequired: totalRequired - completedRequired,
      totalOptional: 3,
      completedOptional: empDocs.filter((d) => !d.isRequired).length,
      completenessPercentage,
      status,
      missingDocuments,
      expiringDocumentsCount: expiringCount,
      expiredDocumentsCount: expiredCount,
      pendingReviewCount: pendingCount,
      verifiedCount,
      lastUpdated: new Date().toISOString(),
    };
  }

  public getAllEmployeeCompleteness(): EmployeeDocumentCompleteness[] {
    return INITIAL_EMPLOYEES.map((emp) => this.getEmployeeDocumentCompleteness(emp.id));
  }

  public getDocumentComplianceSummary(): DocumentComplianceSummary {
    const allCompleteness = this.getAllEmployeeCompleteness();
    const allDocs = this.getDocuments({ showArchived: false });
    const categories = this.getCategories();

    const totalEmployees = allCompleteness.length;
    const completeEmployeesCount = allCompleteness.filter((c) => c.status === 'COMPLETE').length;
    const incompleteEmployeesCount = allCompleteness.filter((c) => c.status === 'INCOMPLETE').length;
    const partialEmployeesCount = allCompleteness.filter((c) => c.status === 'PARTIAL').length;

    const complianceRate = totalEmployees > 0 ? Math.round((completeEmployeesCount / totalEmployees) * 100) : 0;

    const expiringSoonCount = allDocs.filter((d) => d.status === 'EXPIRING_SOON').length;
    const expiredCount = allDocs.filter((d) => d.status === 'EXPIRED').length;
    const pendingReviewCount = allDocs.filter((d) => d.status === 'PENDING_REVIEW').length;
    const verifiedCount = allDocs.filter((d) => d.status === 'VERIFIED').length;
    const rejectedCount = allDocs.filter((d) => d.status === 'REJECTED').length;

    const categoryDistribution = categories.map((cat) => {
      const catDocs = allDocs.filter((d) => d.documentCategoryId === cat.id);
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        totalDocuments: catDocs.length,
        verifiedCount: catDocs.filter((d) => d.status === 'VERIFIED').length,
      };
    });

    const attentionAlerts: DocumentComplianceSummary['attentionAlerts'] = [];

    // Critical Alerts for Expired Docs
    const expiredDocs = allDocs.filter((d) => d.status === 'EXPIRED');
    expiredDocs.forEach((doc) => {
      const emp = this.getEmployee(doc.employeeId);
      attentionAlerts.push({
        id: `alert-exp-${doc.id}`,
        severity: 'CRITICAL',
        title: `Dokumen Kedaluwarsa: ${doc.documentName}`,
        description: `Dokumen milik ${emp?.fullName || 'Karyawan'} telah kedaluwarsa sejak ${doc.expiryDate}. Segera perbarui dokumen.`,
        employeeId: doc.employeeId,
        employeeName: emp?.fullName || 'Karyawan',
        documentId: doc.id,
        targetSubView: 'expirations',
      });
    });

    // High Alerts for Expiring Soon (<7 days)
    const criticalExpiring = allDocs.filter((d) => {
      if (!d.expiryDate || d.isArchived || d.status === 'EXPIRED') return false;
      const days = Math.ceil((new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 7;
    });

    criticalExpiring.forEach((doc) => {
      const emp = this.getEmployee(doc.employeeId);
      const days = Math.ceil((new Date(doc.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      attentionAlerts.push({
        id: `alert-soon-${doc.id}`,
        severity: 'HIGH',
        title: `Segera Berakhir (${days} Hari): ${doc.documentName}`,
        description: `Masa berlaku dokumen ${doc.documentName} (${emp?.fullName}) tersisa ${days} hari lagi (${doc.expiryDate}).`,
        employeeId: doc.employeeId,
        employeeName: emp?.fullName || 'Karyawan',
        documentId: doc.id,
        targetSubView: 'expirations',
      });
    });

    // Medium Alerts for Pending Verification
    if (pendingReviewCount > 0) {
      attentionAlerts.push({
        id: 'alert-pending-reviews',
        severity: 'MEDIUM',
        title: `${pendingReviewCount} Dokumen Menunggu Verifikasi`,
        description: `Terdapat ${pendingReviewCount} berkas baru yang diunggah staf menunggu validasi kelengkapan oleh Manager/Supervisor.`,
        targetSubView: 'approvals',
      });
    }

    return {
      totalEmployees,
      totalDocuments: allDocs.length,
      completeEmployeesCount,
      incompleteEmployeesCount,
      partialEmployeesCount,
      expiringSoonCount,
      expiredCount,
      pendingReviewCount,
      verifiedCount,
      rejectedCount,
      complianceRate,
      categoryDistribution,
      attentionAlerts,
    };
  }

  // ==========================================
  // CONVENIENCE ALIASES & HELPERS
  // ==========================================
  public getComplianceSummary(): DocumentComplianceSummary {
    return this.getDocumentComplianceSummary();
  }

  public getEmployeeCompleteness(employeeId: string): EmployeeDocumentCompleteness {
    return this.getEmployeeDocumentCompleteness(employeeId);
  }

  public isDocumentExpired(expiryDate?: string): boolean {
    if (!expiryDate) return false;
    const days = this.getDaysUntilExpiry(expiryDate);
    return days !== null && days <= 0;
  }

  public getEmployee(employeeId: string): Employee | undefined {
    return INITIAL_EMPLOYEES.find((e) => e.id === employeeId);
  }

  public getDaysUntilExpiry(expiryDate?: string): number | null {
    if (!expiryDate) return null;
    const exp = new Date(expiryDate);
    const now = new Date();
    return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  public exportToCSV(documents?: HRDocument[]): string {
    const docs = documents || this.getDocuments();
    const categories = this.getCategories();
    const types = this.getDocumentTypes();

    const headers = [
      'ID Dokumen',
      'Kode Karyawan',
      'Nama Karyawan',
      'Departemen',
      'Kategori',
      'Tipe Dokumen',
      'Nama Dokumen',
      'Nomor Dokumen',
      'Wajib',
      'Status',
      'Tanggal Rilis',
      'Tanggal Kedaluwarsa',
      'Versi',
      'Diupload Oleh',
      'Diverifikasi Oleh',
      'Catatan',
    ];

    const rows = docs.map((d) => {
      const emp = this.getEmployee(d.employeeId);
      const cat = categories.find((c) => c.id === d.documentCategoryId);
      const type = types.find((t) => t.id === d.documentTypeId);

      return [
        d.id,
        emp?.employeeCode || emp?.employeeNo || d.employeeId,
        `"${emp?.fullName || emp?.name || ''}"`,
        emp?.department || '',
        `"${cat?.name || ''}"`,
        `"${type?.name || ''}"`,
        `"${d.documentName.replace(/"/g, '""')}"`,
        `"${d.documentNumber || '-'}"`,
        d.isRequired ? 'Ya' : 'Tidak',
        d.status,
        d.issueDate || '-',
        d.expiryDate || '-',
        `v${d.version}`,
        `"${d.uploadedBy || ''}"`,
        `"${d.verifiedBy || '-'}"`,
        `"${(d.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    return 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  }

  private matchesExpirationFilter(doc: HRDocument, filter: ExpirationFilterCategory): boolean {
    if (filter === 'ALL') return true;
    if (filter === 'NO_EXPIRY') return !doc.expiryDate;
    if (filter === 'ACTIVE') return doc.status === 'VERIFIED' && (!doc.expiryDate || (this.getDaysUntilExpiry(doc.expiryDate) ?? 1) > 0);

    const days = this.getDaysUntilExpiry(doc.expiryDate);
    if (days === null) return false;

    if (filter === 'EXPIRED') return days <= 0 || doc.status === 'EXPIRED';
    if (filter === 'EXPIRING_7') return days > 0 && days <= 7;
    if (filter === 'EXPIRING_14') return days > 0 && days <= 14;
    if (filter === 'EXPIRING_30') return days > 0 && days <= 30;

    return true;
  }

  // ==========================================
  // CSV EXPORTER
  // ==========================================
  public exportDocumentsToCSV(documents?: HRDocument[]): void {
    const docs = documents || this.getDocuments();
    const categories = this.getCategories();
    const types = this.getDocumentTypes();

    const headers = [
      'ID Dokumen',
      'Kode Karyawan',
      'Nama Karyawan',
      'Departemen',
      'Kategori',
      'Tipe Dokumen',
      'Nama Dokumen',
      'Nomor Dokumen',
      'Wajib',
      'Status',
      'Tanggal Rilis',
      'Tanggal Kedaluwarsa',
      'Versi',
      'Diupload Oleh',
      'Diverifikasi Oleh',
      'Catatan',
    ];

    const rows = docs.map((d) => {
      const emp = this.getEmployee(d.employeeId);
      const cat = categories.find((c) => c.id === d.documentCategoryId);
      const type = types.find((t) => t.id === d.documentTypeId);

      return [
        d.id,
        emp?.employeeCode || emp?.employeeNo || d.employeeId,
        `"${emp?.fullName || emp?.name || ''}"`,
        emp?.department || '',
        `"${cat?.name || ''}"`,
        `"${type?.name || ''}"`,
        `"${d.documentName.replace(/"/g, '""')}"`,
        `"${d.documentNumber || '-'}"`,
        d.isRequired ? 'Ya' : 'Tidak',
        d.status,
        d.issueDate || '-',
        d.expiryDate || '-',
        `v${d.version}`,
        `"${d.uploadedBy || ''}"`,
        `"${d.verifiedBy || '-'}"`,
        `"${(d.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Dokumen_HR_TropicalGarden_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const hrDocumentService = new HRDocumentService();

// Backward compatibility stub mapping for legacy calls
export const HrDocumentService = {
  async getDocuments(...args: any[]) {
    return { data: hrDocumentService.getDocuments(args[0]), error: null };
  },
  async uploadDocument(doc: any) {
    const res = hrDocumentService.createDocument(doc);
    return { success: true, data: res };
  },
  async reviewDocument(id: string, status: string, notes?: string, actor?: string) {
    if (status === 'VERIFIED') {
      const res = hrDocumentService.verifyDocument(id, actor || 'Manager', notes);
      return { success: !!res };
    } else if (status === 'REJECTED') {
      const res = hrDocumentService.rejectDocument(id, notes || 'Ditolak', actor || 'Manager');
      return { success: !!res };
    }
    return { success: true };
  },
  async getVersionHistory(id: string) {
    return { data: hrDocumentService.getDocumentVersions(id), error: null };
  },
  async getDocumentStats() {
    const summary = hrDocumentService.getDocumentComplianceSummary();
    return {
      data: {
        totalDocuments: summary.totalDocuments,
        pendingReviews: summary.pendingReviewCount,
        expiredDocuments: summary.expiredCount,
      },
      error: null,
    };
  },
  async logDocumentDownload(...args: any[]) {
    return { success: true, error: null };
  },
  async getDocumentById(id: string) {
    return { data: hrDocumentService.getDocumentById(id), error: null };
  },
  async getRelatedChecklists(...args: any[]) {
    return { data: [], error: null };
  },
  async getRelatedKpis(...args: any[]) {
    return { data: [], error: null };
  },
  async deleteDocument(id: string) {
    const res = hrDocumentService.deleteDocument(id);
    return { success: res, error: null };
  },
  async submitForReview(id: string, actor: string) {
    const res = hrDocumentService.submitForReview(id, actor);
    return { success: !!res, error: null };
  },
  async approveDocument(id: string, actor?: string, notes?: string) {
    const res = hrDocumentService.verifyDocument(id, actor || 'Manager', notes);
    return { success: !!res, error: null };
  },
  async rejectDocument(id: string, reason: string, actor?: string) {
    const res = hrDocumentService.rejectDocument(id, reason, actor || 'Manager');
    return { success: !!res, error: null };
  },
  async activateDocument(id: string, actor?: string) {
    const res = hrDocumentService.verifyDocument(id, actor || 'Manager');
    return { success: !!res, error: null };
  },
  async archiveDocument(id: string, reason?: string, actor?: string) {
    const res = hrDocumentService.archiveDocument(id, reason || 'Diarsipkan', actor || 'Manager');
    return { success: !!res, error: null };
  },
  async uploadDocumentFile(file: any) {
    return {
      publicUrl: `mock/hr-documents/${file.name}`,
      url: `mock/hr-documents/${file.name}`,
      path: `mock/hr-documents/${file.name}`,
      error: null,
    };
  },
  async createDocument(data: any) {
    const res = hrDocumentService.createDocument(data);
    return { success: true, data: res, error: null };
  },
  async createDocumentVersion(...args: any[]) {
    const first = args[0];
    if (typeof first === 'object' && first.document_id) {
      const res = hrDocumentService.createNewVersion(first.document_id, first, 'HR Manager');
      return { success: !!res, data: res, error: null };
    }
    const [id, data, actor] = args;
    const res = hrDocumentService.createNewVersion(id, data, actor || 'HR Manager');
    return { success: !!res, data: res, error: null };
  },
};
