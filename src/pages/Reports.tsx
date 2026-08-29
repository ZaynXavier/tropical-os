import React from 'react';
import { PagePlaceholder } from '../components/common/PagePlaceholder';
import { FileBarChart, TrendingUp, DollarSign, Users, Award, ShieldCheck } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PagePlaceholder
        moduleTitle="Executive Reports"
        submoduleTitle="Monthly Business Review (MBR)"
        description="Laporan konsolidasi performa bisnis bulanan untuk jajaran Owner & Management mencakup pencapaian Omzet, EBITDA, Rasio Food Cost, Kepuasan Tamu, Produktivitas SDM, dan Evaluasi Action Plan."
        plannedFeatures={[
          'Dashboard MBR Bulanan dengan ringkasan Eksekutif 1 Halaman (Executive Summary)',
          'Analisa komparasi pencapaian target bulanan vs realisasi aktual',
          'Rangkuman evaluasi 8 pilar bisnis Tropical Garden Resto',
          'Grafik tren pertumbuhan Net Profit Margin & Efisiensi OPEX',
          'Pencatatan notula keputusan strategis dan target bulan berikutnya',
          'Ekspor dokumen MBR resmi berformat PDF berstandar korporasi',
        ]}
        phaseTarget="Phase 7 — Monthly Business Review & Executive Intelligence"
        tags={['MBR', 'Executive', 'P&L', 'EBITDA', 'Strategy Review']}
        icon={<FileBarChart className="w-6 h-6" />}
        customMessage="Modul ini hanya dapat diakses oleh akun dengan tingkat wewenang OWNER dan MANAGER sesuai ketetapan dokumen /doc/RBAC.md."
      />
    </div>
  );
}
