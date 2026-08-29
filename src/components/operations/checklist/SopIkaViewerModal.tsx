/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.2 — INLINE SOP & IKA VIEWER MODAL
 * Seamless modal to view Standard Operating Procedure (SOP) or
 * Instruksi Kerja Alat (IKA) directly from checklist execution items.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  FileText,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Layers,
  Wrench,
  ExternalLink,
} from 'lucide-react';
import { sopService } from '../../../services/sopService';
import { ikaService } from '../../../services/ikaService';
import { SopDocument, IkaDocument } from '../../../types/operationalKnowledge';

interface SopIkaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sopId?: string;
  ikaId?: string;
}

export const SopIkaViewerModal: React.FC<SopIkaViewerModalProps> = ({
  isOpen,
  onClose,
  sopId,
  ikaId,
}) => {
  const [activeTab, setActiveTab] = useState<'SOP' | 'IKA'>(sopId ? 'SOP' : 'IKA');
  const [sopDoc, setSopDoc] = useState<SopDocument | null>(null);
  const [ikaDoc, setIkaDoc] = useState<IkaDocument | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadDocs = async () => {
      setLoading(true);
      try {
        if (sopId) {
          const doc = await sopService.getSopById(sopId);
          setSopDoc(doc);
        }
        if (ikaId) {
          const doc = await ikaService.getIkaById(ikaId);
          setIkaDoc(doc);
        }
        if (sopId && !ikaId) setActiveTab('SOP');
        else if (ikaId && !sopId) setActiveTab('IKA');
      } catch (err) {
        console.error('Error loading SOP/IKA document:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDocs();
  }, [isOpen, sopId, ikaId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#151B2B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              {activeTab === 'SOP' ? <BookOpen className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Panduan Standar Operasional
                </span>
                <span className="text-xs text-slate-400">Phase 2C.9 Knowledge Base</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {activeTab === 'SOP'
                  ? sopDoc?.title || 'Standard Operating Procedure (SOP)'
                  : ikaDoc?.title || 'Instruksi Kerja Alat & Teknis (IKA)'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher if both docs exist */}
        {sopId && ikaId && (
          <div className="flex items-center gap-2 px-4 pt-3 border-b border-white/5 bg-[#151B2B]/50">
            <button
              onClick={() => setActiveTab('SOP')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'SOP'
                  ? 'bg-[#111827] text-purple-300 border-t border-x border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> SOP ({sopDoc?.code || 'SOP'})
            </button>
            <button
              onClick={() => setActiveTab('IKA')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'IKA'
                  ? 'bg-[#111827] text-purple-300 border-t border-x border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> IKA ({ikaDoc?.code || 'IKA'})
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">Memuat dokumen operasional...</p>
            </div>
          ) : activeTab === 'SOP' && sopDoc ? (
            <div className="space-y-4">
              {/* Document Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#151B2B] border border-white/5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Kode Dokumen</span>
                  <span className="font-bold text-white">{sopDoc.code}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Divisi</span>
                  <span className="font-bold text-white">{sopDoc.division}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kategori</span>
                  <span className="font-bold text-emerald-400">{sopDoc.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Versi & Tanggal</span>
                  <span className="font-bold text-white">v{sopDoc.version}</span>
                </div>
              </div>

              {/* Purpose */}
              {sopDoc.purpose && (
                <div className="p-3 rounded-xl bg-[#151B2B]/60 border border-white/5">
                  <h4 className="text-xs font-bold text-slate-300 mb-1">Tujuan Prosedur</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{sopDoc.purpose}</p>
                </div>
              )}

              {/* Step by Step Execution Instructions */}
              <div>
                <h4 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Langkah-Langkah Standar Kerja:
                </h4>
                <div className="space-y-2.5">
                  {sopDoc.steps?.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3 rounded-xl bg-[#151B2B] border border-white/5 hover:border-white/10 transition space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {step.stepNumber}
                          </span>
                          <h5 className="text-xs font-bold text-white">{step.title}</h5>
                        </div>
                        {step.responsibleRole && (
                          <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                            {step.responsibleRole}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 pl-7 leading-relaxed">{step.description}</p>
                      {step.criticalPoint && (
                        <div className="ml-7 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-start gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{step.criticalPoint}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'IKA' && ikaDoc ? (
            <div className="space-y-4">
              {/* IKA Document Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#151B2B] border border-white/5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Kode IKA</span>
                  <span className="font-bold text-white">{ikaDoc.code}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Alat</span>
                  <span className="font-bold text-white">{ikaDoc.equipmentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Brand / Model</span>
                  <span className="font-bold text-purple-300">{ikaDoc.brandModel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Lokasi Stasiun</span>
                  <span className="font-bold text-emerald-400">{ikaDoc.locationStation}</span>
                </div>
              </div>

              {/* APD / Safety Equipment Required */}
              {ikaDoc.safetyEquipment && ikaDoc.safetyEquipment.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> APD / Perlengkapan Keselamatan:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {ikaDoc.safetyEquipment.map((eq, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 text-[10px] font-semibold"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Step By Step Instructions */}
              <div>
                <h4 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-purple-400" /> Instruksi Pengoperasian & Sanitasi Alat:
                </h4>
                <div className="space-y-2.5">
                  {ikaDoc.steps?.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3 rounded-xl bg-[#151B2B] border border-white/5 hover:border-white/10 transition space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {step.stepNumber}
                        </span>
                        <h5 className="text-xs font-bold text-white">{step.title}</h5>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 ml-auto">
                          Fase: {step.phase}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 pl-7 leading-relaxed">{step.instruction}</p>
                      {step.safetyWarning && (
                        <div className="ml-7 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{step.safetyWarning}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
              <p className="text-xs">Dokumen SOP / IKA referensi tidak ditemukan.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-[#151B2B] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
