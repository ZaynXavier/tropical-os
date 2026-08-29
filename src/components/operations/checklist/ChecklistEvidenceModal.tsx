/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.2 — CHECKLIST EVIDENCE PHOTO / ATTACHMENT MODAL
 * Camera shutter simulation, photo upload, and instant preview for station evidence proof.
 */

import React, { useState } from 'react';
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface ChecklistEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  onSaveEvidence: (photoUrl: string, note?: string) => void;
}

const PRESET_EVIDENCE_PHOTOS = [
  {
    name: 'Suhu Chiller Digital (2.5°C)',
    url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Talenan 5 Warna & Sanitasi Stainless',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Ekstraksi Espresso & Pressure Gauge Bar',
    url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mise en Place Dining Table & Cutlery',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Dispenser Dishwasher & Chemical Sanitasi',
    url: 'https://images.unsplash.com/photo-1585670270608-b404fb880b91?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Kasir Petty Cash & Kertas Struk Thermal',
    url: 'https://images.unsplash.com/photo-1554415707-9e4966a604f7?auto=format&fit=crop&w=600&q=80',
  },
];

export const ChecklistEvidenceModal: React.FC<ChecklistEvidenceModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  onSaveEvidence,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_EVIDENCE_PHOTOS[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(false);

  if (!isOpen) return null;

  const handleCaptureSimulated = () => {
    setIsSimulatingCamera(true);
    setTimeout(() => {
      setIsSimulatingCamera(false);
      // Pick random photo
      const randomPhoto = PRESET_EVIDENCE_PHOTOS[Math.floor(Math.random() * PRESET_EVIDENCE_PHOTOS.length)].url;
      setSelectedPhoto(randomPhoto);
    }, 600);
  };

  const handleSave = () => {
    const finalUrl = customUrl.trim() || selectedPhoto;
    onSaveEvidence(finalUrl, evidenceNote.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-[#151B2B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Lampirkan Bukti Foto Stasiun</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{itemTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Active Preview */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Pratinjau Foto Bukti Terpilih:
            </label>
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0B0F19] aspect-video flex items-center justify-center group">
              {isSimulatingCamera ? (
                <div className="text-center text-purple-400 animate-pulse">
                  <Camera className="w-8 h-8 mx-auto mb-1 animate-bounce" />
                  <span className="text-xs font-semibold">Mengambil Foto Kamera...</span>
                </div>
              ) : (
                <>
                  <img
                    src={customUrl.trim() || selectedPhoto}
                    alt="Bukti Foto"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] text-white border border-white/10 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Geo & Timestamp Terverifikasi</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Simulation Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCaptureSimulated}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Ambil Foto Kamera
            </button>
            <button
              type="button"
              onClick={() => {
                const nextPhoto = PRESET_EVIDENCE_PHOTOS[Math.floor(Math.random() * PRESET_EVIDENCE_PHOTOS.length)].url;
                setSelectedPhoto(nextPhoto);
                setCustomUrl('');
              }}
              className="py-2 px-3 rounded-xl bg-[#151B2B] hover:bg-[#1E2438] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Ganti Preset
            </button>
          </div>

          {/* Quick Preset Selector Grid */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Pilihan Contoh Bukti Standar Resto:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_EVIDENCE_PHOTOS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPhoto(p.url);
                    setCustomUrl('');
                  }}
                  className={`p-1 rounded-lg border text-left transition overflow-hidden ${
                    selectedPhoto === p.url && !customUrl
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 bg-[#151B2B] hover:border-white/20'
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-12 object-cover rounded-md mb-1" />
                  <p className="text-[10px] text-slate-300 truncate px-0.5">{p.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Catatan / Keterangan Bukti (Opsional):
            </label>
            <input
              type="text"
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              placeholder="Contoh: Suhu termometer chiller stabil pada 2.5°C"
              className="w-full px-3 py-2 rounded-xl bg-[#151B2B] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#151B2B] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition"
          >
            <Check className="w-4 h-4" /> Simpan Bukti Foto
          </button>
        </div>
      </div>
    </div>
  );
};
