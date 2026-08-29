/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.2 — CHECKLIST MASTER TEMPLATE MANAGEMENT VIEW
 * Manage master checklist templates across all 9 Operational Areas,
 * inspect items, critical control points (CCP), SOP/IKA links, and versioning.
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  FileText,
  ShieldAlert,
  BookOpen,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ChecklistTemplate, ChecklistItemTemplate } from '../../../types/operationsChecklist';
import { operationsChecklistService } from '../../../services/operationsChecklistService';
import { SopIkaViewerModal } from './SopIkaViewerModal';

interface ChecklistTemplateManagementViewProps {
  canManage?: boolean;
}

export const ChecklistTemplateManagementView: React.FC<ChecklistTemplateManagementViewProps> = ({
  canManage = true,
}) => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspecting template modal
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);

  // SOP/IKA modal state
  const [sopIkaTarget, setSopIkaTarget] = useState<{ sopId?: string; ikaId?: string } | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const list = await operationsChecklistService.getChecklistTemplates();
      setTemplates(list);
    } catch (err) {
      console.error('Failed to load checklist templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const filteredTemplates = templates.filter((t) => {
    if (selectedAreaFilter !== 'ALL' && t.areaId !== selectedAreaFilter) return false;
    if (selectedTypeFilter !== 'ALL' && t.checklistType !== selectedTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.areaName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Filter Bar */}
      <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode atau judul template..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* Area Filter */}
          <select
            value={selectedAreaFilter}
            onChange={(e) => setSelectedAreaFilter(e.target.value)}
            className="bg-[#0B0F19] text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 focus:outline-hidden cursor-pointer [&>option]:bg-[#111827]"
          >
            <option value="ALL">Semua Area Operasional</option>
            <option value="area-kitchen">Kitchen (Dapur)</option>
            <option value="area-bar">Bar & Beverage</option>
            <option value="area-service">Service Floor</option>
            <option value="area-cleaning">Steward & Cleaning</option>
            <option value="area-purchasing">Purchasing</option>
            <option value="area-inventory">Inventory</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-[#0B0F19] text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 focus:outline-hidden cursor-pointer [&>option]:bg-[#111827]"
          >
            <option value="ALL">Semua Tipe Checklist</option>
            <option value="OPENING">OPENING</option>
            <option value="MID_SHIFT">MID_SHIFT</option>
            <option value="CLOSING">CLOSING</option>
            <option value="HYGIENE_AUDIT">HYGIENE_AUDIT</option>
            <option value="EQUIPMENT_CHECK">EQUIPMENT_CHECK</option>
          </select>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Total: <strong className="text-white">{filteredTemplates.length}</strong> Template
            </span>
          </div>
        )}
      </div>

      {/* Template Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 bg-[#151B2B] rounded-2xl border border-white/10">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Memuat master template checklist...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-[#151B2B] rounded-2xl border border-white/10 p-6">
          <Layers className="w-12 h-12 mx-auto text-slate-500 opacity-40 mb-2" />
          <h4 className="text-sm font-bold text-white">Tidak Ada Template</h4>
          <p className="text-xs text-slate-400">Tidak ada template yang sesuai filter pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tpl) => {
            const ccpCount = tpl.items.filter((i) => i.criticalControlPoint).length;

            return (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-[#151B2B] border border-white/10 shadow-xl flex flex-col justify-between space-y-4 hover:border-white/20 transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {tpl.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {tpl.checklistType}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                {/* Meta details */}
                <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Area Operasional:</span>
                    <span className="font-semibold text-white">{tpl.areaName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jumlah Task:</span>
                    <span className="font-semibold text-emerald-400">
                      {tpl.items.length} Task
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Titik Kritis (CCP):</span>
                    <span
                      className={`font-semibold ${
                        ccpCount > 0 ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {ccpCount} Titik CCP
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className="w-full py-2 bg-[#0B0F19] hover:bg-purple-600 hover:text-white text-slate-300 rounded-xl text-xs font-semibold border border-white/10 hover:border-purple-500 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Pratinjau Daftar Task ({tpl.items.length})
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Template Detail Drawer / Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#151B2B] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                      {selectedTemplate.code}
                    </span>
                    <span className="text-xs text-slate-400">
                      Area: {selectedTemplate.areaName} • Tipe: {selectedTemplate.checklistType}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5">{selectedTemplate.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              >
                &times;
              </button>
            </div>

            {/* Items Table / List */}
            <div className="p-5 overflow-y-auto custom-scrollbar space-y-3 flex-1">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Daftar Task Master Template:
              </h4>

              <div className="space-y-2.5">
                {selectedTemplate.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#151B2B] border border-white/5 hover:border-white/10 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/5 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                          {item.sequence}
                        </span>
                        <h5 className="text-xs font-bold text-white">{item.title}</h5>
                        {item.criticalControlPoint && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> CCP
                          </span>
                        )}
                        {item.isRequired && (
                          <span className="text-[10px] text-rose-400 font-bold">*Wajib</span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 pl-7">{item.description}</p>

                    {/* Meta specifics */}
                    <div className="pl-7 flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      {item.requiresNumericValue && (
                        <div className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          Nilai Ukur: {item.minValue} - {item.maxValue} {item.unit}
                        </div>
                      )}
                      {item.requiresPhoto && (
                        <div className="text-[11px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md">
                          Wajib Foto Bukti
                        </div>
                      )}
                      {item.sopReferenceId && (
                        <button
                          type="button"
                          onClick={() =>
                            setSopIkaTarget({
                              sopId: item.sopReferenceId,
                              ikaId: item.ikaReferenceId,
                            })
                          }
                          className="text-[10px] text-purple-300 hover:text-white bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" /> SOP: {item.sopReferenceCode || 'Lihat'}
                        </button>
                      )}
                      {item.ikaReferenceId && (
                        <button
                          type="button"
                          onClick={() => setSopIkaTarget({ ikaId: item.ikaReferenceId })}
                          className="text-[10px] text-blue-300 hover:text-white bg-blue-500/15 px-2 py-0.5 rounded-md border border-blue-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" /> IKA: {item.ikaReferenceCode || 'Lihat'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-[#151B2B] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOP / IKA Modal */}
      {sopIkaTarget && (
        <SopIkaViewerModal
          isOpen={!!sopIkaTarget}
          onClose={() => setSopIkaTarget(null)}
          sopId={sopIkaTarget.sopId}
          ikaId={sopIkaTarget.ikaId}
        />
      )}
    </div>
  );
};
