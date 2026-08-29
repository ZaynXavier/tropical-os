/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — ISSUE EVIDENCE GALLERY
 * Component for displaying issue photo evidence thumbnails & attachment modal
 */

import React, { useState } from 'react';
import { Image, Upload, Plus, X, Eye, FileText } from 'lucide-react';
import { IssueEvidence } from '../../../types/operationalIssue';

interface IssueEvidenceGalleryProps {
  evidence: IssueEvidence[];
  onUploadEvidence?: (evidence: IssueEvidence) => void;
  canUpload?: boolean;
  uploaderEmployeeId?: string;
  uploaderEmployeeName?: string;
}

export const IssueEvidenceGallery: React.FC<IssueEvidenceGalleryProps> = ({
  evidence,
  onUploadEvidence,
  canUpload = false,
  uploaderEmployeeId = 'emp-01',
  uploaderEmployeeName = 'Staf Operasional',
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const newEv: IssueEvidence = {
      id: `ev-${Date.now()}`,
      fileName: `evidence_${Date.now().toString().slice(-4)}.jpg`,
      photoUrl: newUrl.trim(),
      type: 'IMAGE',
      uploadedBy: uploaderEmployeeId,
      uploadedByName: uploaderEmployeeName,
      uploadedAt: new Date().toISOString(),
      description: newDesc.trim() || 'Foto Bukti Kendala Operasional',
    };

    if (onUploadEvidence) {
      onUploadEvidence(newEv);
    }

    setNewUrl('');
    setNewDesc('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Image className="w-3.5 h-3.5 text-purple-400" />
          Bukti Foto / Lampiran ({evidence.length})
        </span>
        {canUpload && onUploadEvidence && (
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-all"
          >
            <Plus className="w-3 h-3" />
            Tambah Bukti
          </button>
        )}
      </div>

      {evidence.length === 0 ? (
        <div className="bg-[#0B0F19] rounded-xl p-3 border border-white/5 text-center text-xs text-slate-500">
          Belum ada foto/dokumen bukti terlampir.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {evidence.map((item) => (
            <div
              key={item.id}
              onClick={() => item.photoUrl && setSelectedImage(item.photoUrl)}
              className="group relative bg-[#0B0F19] rounded-xl overflow-hidden border border-white/10 aspect-video cursor-pointer hover:border-purple-500/50 transition-all"
            >
              {item.photoUrl ? (
                <img
                  src={item.photoUrl}
                  alt={item.fileName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50 p-2 text-slate-400">
                  <FileText className="w-6 h-6 text-purple-400 mb-1" />
                  <span className="text-[10px] truncate max-w-full">{item.fileName}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-xs text-white">
                <Eye className="w-4 h-4 text-purple-300 mr-1" />
                Lihat Foto
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Bukti Foto Full Size"
              className="w-full max-h-[80vh] object-contain rounded-xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* Upload Simulation Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                Tambah Lampiran Bukti
              </h4>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulatedUpload} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  URL Gambar Bukti (Image URL)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Keterangan Foto</label>
                <input
                  type="text"
                  placeholder="Contoh: Kondisi suhu display chiller"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-white"
                >
                  Simpan Bukti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
