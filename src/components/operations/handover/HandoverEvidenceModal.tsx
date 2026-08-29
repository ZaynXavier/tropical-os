/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.3 — HANDOVER EVIDENCE MODAL
 * Preview & simulated upload modal for photo evidence
 */

import React, { useState } from 'react';
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  Calendar,
  User,
  Plus,
} from 'lucide-react';
import { HandoverEvidence } from '../../../types/handover';

interface HandoverEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: HandoverEvidence[];
  onAddEvidence?: (newEv: HandoverEvidence) => void;
  canUpload?: boolean;
}

export const HandoverEvidenceModal: React.FC<HandoverEvidenceModalProps> = ({
  isOpen,
  onClose,
  evidence,
  onAddEvidence,
  canUpload = false,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<HandoverEvidence | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HandoverEvidence['category']>('STATION');

  if (!isOpen) return null;

  const SAMPLE_SIMULATED_PHOTOS = [
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
  ];

  const handleSimulatedUpload = () => {
    if (!description.trim() || !onAddEvidence) return;
    const randomImg = SAMPLE_SIMULATED_PHOTOS[Math.floor(Math.random() * SAMPLE_SIMULATED_PHOTOS.length)];
    const newEv: HandoverEvidence = {
      id: `ev-${Date.now()}`,
      photoUrl: randomImg,
      timestamp: new Date().toISOString(),
      uploadedBy: 'emp-06',
      uploadedByName: 'Stator Operational',
      description: description.trim(),
      category,
    };
    onAddEvidence(newEv);
    setDescription('');
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Galeri Bukti Foto Handover</h3>
              <p className="text-xs text-slate-400">
                Dokumentasi kondisi fisik stasiun, mesin, dan kebersihan saat serah terima
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {/* Main Photo Viewer if selected */}
          {selectedPhoto && (
            <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-4 space-y-3 animate-fade-in">
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.description}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <p className="text-white font-medium">{selectedPhoto.description}</p>
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>Oleh: {selectedPhoto.uploadedByName}</span>
                  <span>
                    {new Date(selectedPhoto.timestamp).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Evidence */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Daftar Foto Terlampir ({evidence.length})
              </h4>

              {canUpload && !isUploading && (
                <button
                  onClick={() => setIsUploading(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Bukti Foto
                </button>
              )}
            </div>

            {/* Upload Form Box */}
            {isUploading && (
              <div className="mb-4 bg-[#0B0F19] p-4 rounded-xl border border-purple-500/30 space-y-3">
                <h5 className="text-xs font-bold text-purple-300">Simulasi Unggah Bukti Foto Baru</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Kategori Foto</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white"
                    >
                      <option value="STATION">Kondisi Stasiun</option>
                      <option value="EQUIPMENT">Peralatan / Mesin</option>
                      <option value="STOCK">Bahan & Stok</option>
                      <option value="CLEANLINESS">Kebersihan & Sanitasi</option>
                      <option value="DAMAGE">Kerusakan / Issue</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Deskripsi Catatan Foto</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kondisi burner wok dan grease trap bersih"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#151B2B] rounded-xl border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsUploading(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 text-xs hover:bg-white/10"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSimulatedUpload}
                    disabled={!description.trim()}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 disabled:opacity-50"
                  >
                    Simpan Foto
                  </button>
                </div>
              </div>
            )}

            {evidence.length === 0 ? (
              <div className="bg-[#0B0F19] rounded-xl p-8 text-center border border-white/5">
                <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Tidak ada lampiran foto untuk handover ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evidence.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedPhoto(ev)}
                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all aspect-video bg-[#0B0F19] ${
                      selectedPhoto?.id === ev.id
                        ? 'border-purple-500 ring-2 ring-purple-500/30'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={ev.photoUrl}
                      alt={ev.description}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                      <span className="text-[10px] font-semibold text-white truncate">
                        {ev.description}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {ev.category || 'Bukti Stasiun'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0B0F19] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
