/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Opportunity } from "../../data/mockCrmData";
import {
  Plus,
  ArrowRight,
  User,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
} from "lucide-react";

interface CrmPipelineProps {
  opportunities?: Opportunity[];
  onUpdateStage: (id: string, newStage: Opportunity["stage"]) => void;
  onOpenAddDeal: () => void;
  onCreateQuotationForDeal?: (deal: Opportunity) => void;
}

const STAGES: { id: Opportunity["stage"]; label: string; color: string }[] = [
  { id: "New Lead", label: "New Lead", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { id: "Contacted", label: "Terhubungi", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  { id: "Quotation Sent", label: "Penawaran", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { id: "Negotiation", label: "Negosiasi", color: "bg-pink-500/20 text-pink-300 border-pink-500/40" },
  { id: "Closed Won", label: "Closed Won", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { id: "Closed Lost", label: "Closed Lost", color: "bg-white/10 text-purple-200 border-white/20" },
];

export const CrmPipeline: React.FC<CrmPipelineProps> = ({
  opportunities = [],
  onUpdateStage,
  onOpenAddDeal,
  onCreateQuotationForDeal,
}) => {
  const safeOpportunities = opportunities || [];
  const [selectedDeal, setSelectedDeal] = useState<Opportunity | null>(null);

  const calculateStageTotal = (stage: Opportunity["stage"]) => {
    return safeOpportunities
      .filter((o) => o.stage === stage)
      .reduce((sum, item) => sum + (item.dealValue || 0), 0);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-purple-300 uppercase tracking-widest mb-0.5">
            <TrendingUp className="w-3.5 h-3.5 text-pink-400" />
            <span>Kanban Deal Tracking</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Sales Pipeline &amp; Event Deals</h2>
          <p className="text-xs text-purple-200/70 mt-0.5">
            Pantau status prospek reservasi acara, paket wedding, gathering, dan catering harian.
          </p>
        </div>
        <button
          onClick={onOpenAddDeal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-purple-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Deal Baru</span>
        </button>
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4 custom-scrollbar">
        {STAGES.map((stage) => {
          const stageDeals = safeOpportunities.filter((o) => o.stage === stage.id);
          const totalVal = calculateStageTotal(stage.id);

          return (
            <div
              key={stage.id}
              className="bg-[#0D0922]/80 p-3.5 rounded-3xl border border-white/10 backdrop-blur-xl flex flex-col min-w-[240px] md:min-w-0 shadow-2xl"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="text-xs font-extrabold text-purple-300/80">{stageDeals.length}</span>
              </div>
              <div className="text-[11px] font-mono font-black text-emerald-400 mb-3 pb-2 border-b border-white/10">
                Rp {(totalVal / 1000000).toFixed(1)}M
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 min-h-[300px]">
                {stageDeals.length === 0 ? (
                  <div className="text-center py-10 text-[11px] text-purple-300/40 border-2 border-dashed border-white/10 rounded-2xl">
                    Belum ada deal
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className="bg-[#130F30] p-3.5 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/50 transition-all cursor-pointer space-y-2.5 hover:scale-[1.02]"
                    >
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{deal.title}</h4>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-black text-emerald-400">
                          Rp {(deal.dealValue / 1000000).toFixed(1)}Jt
                        </span>
                        <span className="text-[10px] bg-purple-950/80 px-2 py-0.5 rounded-full text-purple-300 font-mono border border-purple-500/30">
                          {deal.probability}%
                        </span>
                      </div>

                      <div className="text-[10px] text-purple-300/70 space-y-1 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate text-purple-200">{deal.customerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-purple-400 shrink-0" />
                            <span>{deal.guestCount} Pax</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-purple-400 shrink-0" />
                            <span>{deal.eventDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Move Buttons */}
                      <div className="pt-2 flex items-center justify-between gap-1 border-t border-white/10">
                        {deal.stage !== "Closed Won" && deal.stage !== "Closed Lost" && (
                          <div className="flex items-center gap-1 w-full justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentIndex = STAGES.findIndex((s) => s.id === deal.stage);
                                if (currentIndex < STAGES.length - 2) {
                                  onUpdateStage(deal.id, STAGES[currentIndex + 1].id);
                                }
                              }}
                              className="text-[10px] text-purple-300 hover:text-white font-bold hover:bg-white/10 px-2 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>Maju</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStage(deal.id, "Closed Won");
                              }}
                              title="Tandai Won"
                              className="text-[10px] text-emerald-300 font-bold hover:bg-emerald-500/20 px-2 py-1 rounded-xl transition-all cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {deal.stage === "Closed Won" && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Won
                          </span>
                        )}
                        {deal.stage === "Closed Lost" && (
                          <span className="text-[10px] text-purple-300/50 font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Lost
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#130F30] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">{selectedDeal.id}</span>
                <h3 className="text-base font-extrabold text-white">{selectedDeal.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-purple-300 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div>
                  <span className="text-purple-300/60 block text-[10px]">Nilai Deal</span>
                  <strong className="text-sm text-emerald-400 font-black">
                    Rp {(selectedDeal.dealValue || 0).toLocaleString("id-ID")}
                  </strong>
                </div>
                <div>
                  <span className="text-purple-300/60 block text-[10px]">Tanggal Event</span>
                  <strong className="text-sm text-white">{selectedDeal.eventDate}</strong>
                </div>
              </div>

              <div className="space-y-2 text-purple-200/80">
                <p><strong className="text-white">Nama Klien:</strong> {selectedDeal.customerName}</p>
                <p><strong className="text-white">Telepon:</strong> +{selectedDeal.phone}</p>
                {selectedDeal.company && <p><strong className="text-white">Perusahaan:</strong> {selectedDeal.company}</p>}
                <p><strong className="text-white">Jumlah Tamu:</strong> {selectedDeal.guestCount} Pax</p>
                <p><strong className="text-white">PIC CRM:</strong> {selectedDeal.assignedTo}</p>
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-bold text-purple-200 block mb-1">
                  Ubah Stage Status:
                </label>
                <select
                  value={selectedDeal.stage}
                  onChange={(e) => {
                    const newStg = e.target.value as Opportunity["stage"];
                    onUpdateStage(selectedDeal.id, newStg);
                    setSelectedDeal({ ...selectedDeal, stage: newStg });
                  }}
                  className="w-full p-2.5 bg-[#0D0922] border border-white/10 rounded-2xl text-xs font-bold text-white"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
              {onCreateQuotationForDeal && (
                <button
                  onClick={() => {
                    onCreateQuotationForDeal(selectedDeal);
                    setSelectedDeal(null);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Buat Quotation</span>
                </button>
              )}
              <button
                onClick={() => setSelectedDeal(null)}
                className="ml-auto px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
