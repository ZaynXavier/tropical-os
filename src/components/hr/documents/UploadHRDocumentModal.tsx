/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 2C.8 — Upload & Update HR Document Modal
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  User,
  Shield,
  FileCheck,
} from 'lucide-react';
import { HRDocument, HRDocumentCategory, HRDocumentType } from '../../../types/hrDocument';
import { hrDocumentService } from '../../../services/hrDocumentService';
import { INITIAL_EMPLOYEES } from '../../../data/employees';
import { User as AuthUser } from '../../../types';

interface UploadHRDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: HRDocument) => void;
  currentUser: AuthUser;
  defaultEmployeeId?: string;
  defaultDocumentTypeId?: string;
  editingDocument?: HRDocument | null;
}

export const UploadHRDocumentModal: React.FC<UploadHRDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  defaultEmployeeId,
  defaultDocumentTypeId,
  editingDocument,
}) => {
  const [categories, setCategories] = useState<HRDocumentCategory[]>([]);
  const [documentTypes, setDocumentTypes] = useState<HRDocumentType[]>([]);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    editingDocument?.employeeId || defaultEmployeeId || currentUser.id || 'emp-02'
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    editingDocument?.documentCategoryId || ''
  );
  const [selectedTypeId, setSelectedTypeId] = useState<string>(
    editingDocument?.documentTypeId || defaultDocumentTypeId || ''
  );
  const [documentName, setDocumentName] = useState<string>(
    editingDocument?.documentName || ''
  );
  const [documentNumber, setDocumentNumber] = useState<string>(
    editingDocument?.documentNumber || ''
  );
  const [issueDate, setIssueDate] = useState<string>(
    editingDocument?.issueDate || ''
  );
  const [expiryDate, setExpiryDate] = useState<string>(
    editingDocument?.expiryDate || ''
  );
  const [notes, setNotes] = useState<string>(editingDocument?.notes || '');
  const [isRequired, setIsRequired] = useState<boolean>(
    editingDocument?.isRequired ?? true
  );

  // Mock File Upload State
  const [selectedFileName, setSelectedFileName] = useState<string>(
    editingDocument?.fileName || ''
  );
  const [selectedFileSize, setSelectedFileSize] = useState<number>(
    editingDocument?.fileSize || 250000
  );
  const [selectedFileType, setSelectedFileType] = useState<string>(
    editingDocument?.fileType || 'application/pdf'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isStaffOnly =
    currentUser.role === 'STAFF' ||
    (currentUser as any).accessLevel === 'STAFF';

  useEffect(() => {
    if (isOpen) {
      const cats = hrDocumentService.getCategories();
      const types = hrDocumentService.getDocumentTypes();
      setCategories(cats);
      setDocumentTypes(types);

      if (editingDocument) {
        setSelectedEmployeeId(editingDocument.employeeId);
        setSelectedCategoryId(editingDocument.documentCategoryId);
        setSelectedTypeId(editingDocument.documentTypeId);
        setDocumentName(editingDocument.documentName);
        setDocumentNumber(editingDocument.documentNumber || '');
        setIssueDate(editingDocument.issueDate || '');
        setExpiryDate(editingDocument.expiryDate || '');
        setNotes(editingDocument.notes || '');
        setIsRequired(editingDocument.isRequired);
        setSelectedFileName(editingDocument.fileName);
        setSelectedFileSize(editingDocument.fileSize);
        setSelectedFileType(editingDocument.fileType);
      } else {
        const empId = isStaffOnly
          ? currentUser.id
          : defaultEmployeeId || 'emp-02';
        setSelectedEmployeeId(empId);

        if (defaultDocumentTypeId) {
          const matchedType = types.find((t) => t.id === defaultDocumentTypeId);
          if (matchedType) {
            setSelectedTypeId(matchedType.id);
            setSelectedCategoryId(matchedType.categoryId);
            setDocumentName(matchedType.name);
            setIsRequired(matchedType.defaultRequirementType === 'REQUIRED');
          }
        } else {
          setSelectedCategoryId(cats[0]?.id || 'cat-kontrak');
          const firstType = types.find((t) => t.categoryId === cats[0]?.id);
          if (firstType) {
            setSelectedTypeId(firstType.id);
            setDocumentName(firstType.name);
            setIsRequired(firstType.defaultRequirementType === 'REQUIRED');
          }
        }
      }
      setErrorMessage(null);
    }
  }, [isOpen, editingDocument, defaultEmployeeId, defaultDocumentTypeId]);

  // Handle Category Change -> Auto pick first matching Document Type
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const availableTypes = documentTypes.filter((t) => t.categoryId === catId);
    if (availableTypes.length > 0) {
      setSelectedTypeId(availableTypes[0].id);
      setDocumentName(availableTypes[0].name);
      setIsRequired(availableTypes[0].defaultRequirementType === 'REQUIRED');
    } else {
      setSelectedTypeId('');
    }
  };

  // Handle Type Change -> Auto fill document name & requirement
  const handleTypeChange = (typeId: string) => {
    setSelectedTypeId(typeId);
    const matchedType = documentTypes.find((t) => t.id === typeId);
    if (matchedType) {
      if (!editingDocument) {
        setDocumentName(matchedType.name);
      }
      setIsRequired(matchedType.defaultRequirementType === 'REQUIRED');
    }
  };

  // Simulated File Drop & Picker
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      setSelectedFileSize(file.size);
      setSelectedFileType(file.type || 'application/pdf');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setSelectedFileSize(file.size);
      setSelectedFileType(file.type || 'application/pdf');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedEmployeeId) {
      setErrorMessage('Pilih karyawan pemilik dokumen.');
      return;
    }
    if (!selectedCategoryId || !selectedTypeId) {
      setErrorMessage('Pilih kategori dan tipe dokumen yang valid.');
      return;
    }
    if (!documentName.trim()) {
      setErrorMessage('Masukkan nama dokumen.');
      return;
    }
    if (!selectedFileName) {
      setErrorMessage('Pilih atau unggah berkas file dokumen.');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploaderName =
        currentUser.name || currentUser.username || 'HR Officer';
      const isAutoApproved =
        currentUser.role === 'OWNER' ||
        currentUser.role === 'MANAGER' ||
        (currentUser as any).accessLevel === 'OWNER' ||
        (currentUser as any).accessLevel === 'MANAGER';

      let resultDoc: HRDocument | null = null;

      if (editingDocument) {
        resultDoc = hrDocumentService.updateDocument(
          editingDocument.id,
          {
            employeeId: selectedEmployeeId,
            documentCategoryId: selectedCategoryId,
            documentTypeId: selectedTypeId,
            documentName,
            documentNumber: documentNumber || undefined,
            issueDate: issueDate || undefined,
            expiryDate: expiryDate || undefined,
            notes: notes || undefined,
            isRequired,
            fileName: selectedFileName,
            fileSize: selectedFileSize,
            fileType: selectedFileType,
          },
          uploaderName
        );
      } else {
        resultDoc = hrDocumentService.createDocument({
          employeeId: selectedEmployeeId,
          documentCategoryId: selectedCategoryId,
          documentTypeId: selectedTypeId,
          documentName,
          documentNumber: documentNumber || undefined,
          description: `Dokumen administrasi SDM - ${documentName}`,
          fileName: selectedFileName,
          fileSize: selectedFileSize,
          fileType: selectedFileType,
          filePath: `mock/hr-documents/${selectedEmployeeId}/${selectedFileName}`,
          issueDate: issueDate || undefined,
          expiryDate: expiryDate || undefined,
          isRequired,
          status: isAutoApproved ? 'VERIFIED' : 'PENDING_REVIEW',
          uploadedBy: uploaderName,
          verifiedBy: isAutoApproved ? uploaderName : undefined,
          verifiedAt: isAutoApproved ? new Date().toISOString() : undefined,
          notes: notes || undefined,
        });
      }

      if (resultDoc) {
        onSuccess(resultDoc);
        onClose();
      } else {
        setErrorMessage('Gagal menyimpan dokumen. Silakan coba lagi.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentType = documentTypes.find((t) => t.id === selectedTypeId);
  const filteredTypes = documentTypes.filter(
    (t) => t.categoryId === selectedCategoryId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#130F30] border border-purple-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/40 via-[#1E1248] to-[#130F30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {editingDocument ? 'Edit Dokumen HR' : 'Unggah Dokumen Kepegawaian'}
              </h2>
              <p className="text-xs text-purple-200/70">
                Penyimpanan metadata berkas administrasi dan pemantauan kepatuhan personel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Employee Selector (Locked for Staff) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>Karyawan Bersangkutan *</span>
            </label>
            {isStaffOnly ? (
              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-200">
                {currentUser.name} ({currentUser.role || 'Staff'})
              </div>
            ) : (
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white cursor-pointer"
              >
                {INITIAL_EMPLOYEES.map((emp) => (
                  <option key={emp.id} value={emp.id} className="bg-[#1A133E] text-white">
                    {emp.fullName || emp.name} - {emp.department} ({emp.primaryPosition || emp.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Category & Document Type (Cascading) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Kategori Dokumen *</span>
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#1A133E] text-white">
                    {cat.name} {cat.isSensitive ? '🔒' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Tipe Dokumen Spesifik *</span>
              </label>
              <select
                value={selectedTypeId}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white cursor-pointer"
              >
                {filteredTypes.map((type) => (
                  <option key={type.id} value={type.id} className="bg-[#1A133E] text-white">
                    {type.name} {type.defaultRequirementType === 'REQUIRED' ? '(Wajib)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Document Name & Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-200">
                Nama / Judul Dokumen *
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Contoh: KTP Asli / Kontrak PKWT 2026"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-200">
                Nomor Dokumen / NIK / No. Surat (Opsional)
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Contoh: 317101... / PKWT/2026/001"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* 4. Validity & Expiry Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Tanggal Rilis / Penerbitan</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Tanggal Kedaluwarsa (Masa Berlaku)</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white cursor-pointer"
              />
              <p className="text-[10px] text-purple-300/60">
                Kosongkan jika dokumen berlaku seumur hidup (misal: KTP, KK, Ijazah).
              </p>
            </div>
          </div>

          {/* 5. Mock File Drop Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-200">
              Unggah File Dokumen (PDF, JPG, PNG) *
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
                isDragging
                  ? 'border-purple-400 bg-purple-500/20'
                  : selectedFileName
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-white/20 bg-white/5 hover:border-purple-400/50'
              }`}
            >
              <input
                type="file"
                id="hr-doc-file-upload"
                onChange={handleFileInputChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label
                htmlFor="hr-doc-file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  {selectedFileName ? (
                    <FileCheck className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                {selectedFileName ? (
                  <div>
                    <p className="text-xs font-black text-emerald-300">
                      {selectedFileName}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {(selectedFileSize / 1024).toFixed(1)} KB • {selectedFileType}
                    </p>
                    <span className="text-[10px] text-purple-300 underline mt-1 block">
                      Klik untuk ganti file
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-white">
                      Tarik &amp; lepas berkas di sini, atau{' '}
                      <span className="text-purple-400 underline">pilih file</span>
                    </p>
                    <p className="text-[10px] text-purple-300/60 mt-1">
                      Mendukung PDF, JPG, PNG (Maks 10 MB). Disimpan secara aman.
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* 6. Notes / Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-200">
              Catatan Administrasi (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Tambahkan instruksi verifikasi atau informasi tambahan terkait dokumen..."
              className="w-full px-4 py-2 rounded-2xl bg-white/5 border border-white/15 focus:border-purple-400 focus:outline-none text-xs text-white placeholder:text-gray-500 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-white/10 bg-[#17113C] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingDocument ? 'Simpan Perubahan' : 'Unggah Dokumen'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
