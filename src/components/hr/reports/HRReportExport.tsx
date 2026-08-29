/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CSV Export Utility & Modal for HR Reports & Analytics
 */

import React, { useState } from 'react';
import { HRReportSubTab } from '../../../types/hrReports';
import { Download, FileText, CheckCircle2, X } from 'lucide-react';

interface HRReportExportProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: HRReportSubTab;
  onExport: (tab: HRReportSubTab, options?: { delimiter: string }) => void;
  canViewPayroll?: boolean;
}

export const HRReportExportModal: React.FC<HRReportExportProps> = ({
  isOpen,
  onClose,
  activeTab,
  onExport,
  canViewPayroll = true,
}) => {
  const [selectedTab, setSelectedTab] = useState<HRReportSubTab>(activeTab);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    onExport(selectedTab);
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1500);
  };

  const getTabLabel = (tab: HRReportSubTab) => {
    switch (tab) {
      case 'OVERVIEW':
        return 'Ringkasan Eksekutif & Health Score';
      case 'ATTENDANCE':
        return 'Laporan Presensi & Keterlambatan';
      case 'MANPOWER':
        return 'Laporan Utilisasi Manpower & Shift';
      case 'BREAK':
        return 'Laporan Disiplin Break';
      case 'OVERTIME':
        return 'Laporan Lembur & SPL';
      case 'PAYROLL':
        return 'Laporan Beban Gaji & Payroll';
      case 'DOCUMENTS':
        return 'Laporan Kepatuhan Dokumen SDM';
      case 'SOP':
        return 'Laporan Kepatuhan SOP';
      case 'CHECKLIST':
        return 'Laporan Kepatuhan Checklist Operasional';
      case 'PERFORMANCE':
        return 'Laporan Kinerja & Peringkat Personel';
      case 'MONTHLY':
        return 'Laporan Bulanan MBR Eksekutif';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Export Laporan SDM (CSV)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#111827] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {downloadSuccess ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-xs">File CSV Berhasil Diunduh!</h4>
            <p className="text-gray-400 text-[11px]">Format siap dibuka di Microsoft Excel atau Google Sheets.</p>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <p className="text-gray-300">
              Pilih modul data HR yang ingin diexport ke dalam format spreadsheet (.csv):
            </p>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Kategori Laporan:</label>
              <select
                value={selectedTab}
                onChange={(e) => setSelectedTab(e.target.value as HRReportSubTab)}
                className="w-full bg-[#111827] border border-[#2D374E] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="OVERVIEW">Ringkasan Eksekutif &amp; Health Score</option>
                <option value="ATTENDANCE">Laporan Presensi &amp; Keterlambatan</option>
                <option value="MANPOWER">Laporan Utilisasi Manpower</option>
                <option value="BREAK">Laporan Disiplin Break</option>
                <option value="OVERTIME">Laporan Lembur &amp; SPL</option>
                {canViewPayroll && <option value="PAYROLL">Laporan Beban Gaji &amp; Payroll</option>}
                <option value="DOCUMENTS">Laporan Dokumen SDM</option>
                <option value="SOP">Laporan Kepatuhan SOP</option>
                <option value="CHECKLIST">Laporan Checklist Operasional</option>
                <option value="PERFORMANCE">Laporan Kinerja &amp; Health Score Ranking</option>
                <option value="MONTHLY">Laporan Bulanan MBR Eksekutif</option>
              </select>
            </div>

            <div className="bg-[#111827] p-3 rounded-xl border border-[#2D374E] text-[11px] text-gray-400">
              <span className="font-semibold text-gray-200 block mb-1">Karakteristik Export:</span>
              <ul className="space-y-0.5 list-disc list-inside text-gray-400">
                <li>Encoding: UTF-8 dengan BOM (Aman untuk Excel)</li>
                <li>Pemisah Kolom: Koma (,)</li>
                <li>Format Angka: Nilai mentah tanpa format simbol mata uang</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#111827] text-gray-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
