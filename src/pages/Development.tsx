import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MASTER_NAVIGATION } from '../config/navigation';
import { PagePlaceholder } from '../components/common/PagePlaceholder';
import { GraduationCap, Target, CheckCircle2, TrendingUp, Sparkles, BookOpen, Megaphone, Flag } from 'lucide-react';
import { permissionService } from '../services/permissionService';

export default function Development() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const devModule = MASTER_NAVIGATION.find((m) => m.id === 'development');

  const availableSubmodules = (devModule?.submodules || []).filter((sub) =>
    permissionService.canViewSubmodule(currentUser, 'development', sub)
  );

  const activeSubParam = searchParams.get('sub') || (availableSubmodules[0]?.subParam || 'business-academy');
  const activeSubmodule = availableSubmodules.find((s) => s.subParam === activeSubParam) || availableSubmodules[0];

  const getSubmoduleContent = (param: string) => {
    switch (param) {
      case 'business-academy':
        return {
          title: 'Business Academy & Knowledge Base',
          desc: 'Pusat pembelajaran mandiri strategi bisnis restoran, hospitality berstandar internasional, teknik upselling, dan kepemimpinan tim.',
          features: [
            'Modul kursus digital & video materi hospitality restoran',
            'Kuis pemahaman materi pasca-pelatihan',
            'Sertifikasi internal kelulusan level kompetensi staf',
            'Pustaka studi kasus penanganan situasi sulit dengan tamu',
          ],
          phase: 'Phase 5 — Development & Academy',
          tags: ['Academy', 'Training', 'Hospitality', 'Learning'],
        };

      case 'hr-academy':
        return {
          title: 'HR Academy & Leadership Training',
          desc: 'Pelatihan khusus bagi para Supervisor dan calon Leader mengenai teknik komunikasi asertif, resolusi konflik, dan coaching performa tim.',
          features: [
            'Kurikulum kepemimpinan shift dan manajemen emosi tim resto',
            'Panduan teknik one-on-one coaching & pemberian feedback membangun',
            'Pelatihan penanganan komplain tingkat lanjut (L2 Escalation)',
            'Evaluasi kesiapan promosi staf ke jenjang supervisor',
          ],
          phase: 'Phase 5 — Development & Academy',
          tags: ['Leadership', 'Coaching', 'Supervisor Training', 'Conflict Resolution'],
        };

      case 'assessment':
        return {
          title: 'Business Assessment & Gap Analysis',
          desc: 'Audit berkala kesehatan 8 pilar operasional & bisnis Tropical Garden Resto untuk mengidentifikasi celah inefisiensi.',
          features: [
            'Kuesioner audit berkala 8 pilar bisnis restoran',
            'Skor radar kesehatan (Produk, Pelayanan, Kebersihan, SDM, Finansial, Marketing, Brand, Sistem)',
            'Identifikasi otomatis titik kelemahan (Critical Gap Areas)',
            'Rekomendasi prioritas inisiatif perbaikan',
          ],
          phase: 'Phase 5 — Development & Academy',
          tags: ['Assessment', 'Gap Analysis', 'Audit', 'Health Check'],
        };

      case 'action-plan':
        return {
          title: 'Action Plan Matrix & Initiatives',
          desc: 'Matriks rencana aksi nyata berdasarkan temuan audit, target penyelesaian (Timeline), alokasi penanggung jawab (PIC), dan KPI keberhasilan.',
          features: [
            'Tabel Action Plan terstruktur dengan target deadline (W1 - W4)',
            'Penetapan PIC spesifik dari jajaran supervisor / manajer',
            'Tingkat prioritas tindakan (High Impact, Quick Wins, Strategic)',
            'Review mingguan kemajuan inisiatif bersama Owner',
          ],
          phase: 'Phase 5 — Development & Academy',
          tags: ['Action Plan', 'Initiatives', 'Milestones', 'Strategy'],
        };

      case 'task':
        return {
          title: 'Development Task Distribution',
          desc: 'Penyaluran tugas spesifik proyek pengembangan (e.g. Uji coba resep baru, foto katalog ulang, perbaikan instalasi taman) kepada tim terkait.',
          features: [
            'Pembuatan task pengembangan dengan checklist sub-tugas',
            'Penugasan ke karyawan tertentu dengan tanggal jatuh tempo',
            'Lampiran dokumen brief kerja & panduan eksekusi',
            'Status tugas (To Do, In Progress, Review, Done)',
          ],
          phase: 'Phase 5 — Development & Academy',
          tags: ['Task', 'Assignment', 'Projects', 'Execution'],
        };

      case 'progress':
        return {
          title: 'Development Progress & Realization',
          desc: 'Monitoring visual tingkat realisasi penyelesaian rencana aksi dan proyek pengembangan terhadap target waktu yang telah disepakati.',
          features: [
            'Progress bar visual tingkat penyelesaian inisiatif per pilar',
            'Grafik tren kecepatan eksekusi tim (Burn-down chart)',
            'Peringatan otomatis untuk task yang melewati batas waktu (Overdue)',
            'Rangkuman pencapaian untuk bahan Monthly Business Review (MBR)',
          ],
          phase: 'Phase 5 — Development & Academy',
          tags: ['Progress', 'Tracking', 'Milestones', 'Timeline'],
        };

      case 'branding':
        return {
          title: 'Brand Identity & Guidelines',
          desc: 'Panduan identitas merek Tropical Garden Resto, palet warna resmi, filosofi brand, standar typography, dan aset logo resolusi tinggi.',
          features: [
            'Buku pedoman brand (Brand Guidelines PDF)',
            'Unduh aset resmi logo resto, stempel, dan template kop surat',
            'Panduan tone of voice komunikasi media sosial resto',
            'Standar visual fotografi makanan dan suasana taman',
          ],
          phase: 'Phase 5 — Development & Academy',
          tags: ['Branding', 'Identity', 'Logo Assets', 'Guidelines'],
        };

      case 'marketing':
        return {
          title: 'Marketing Strategy & Positioning',
          desc: 'Rencana pemasaran kuartalan, program kemitraan komunitas lokal, kolaborasi food blogger / influencer, dan positioning menu unggulan.',
          features: [
            'Peta strategi pemasaran kuartalan (Q1 - Q4)',
            'Daftar kontak kemitraan influencer & food vlogger',
            'Perencanaan budget iklan digital (Meta Ads & TikTok Ads)',
            'Analisa efektivitas channel pemasaran terhadap reservasi meja',
          ],
          phase: 'Phase 5 — Development & Academy',
          tags: ['Marketing', 'Influencer', 'Campaign', 'Positioning'],
        };

      case 'promotion':
        return {
          title: 'Promotion & Event Program',
          desc: 'Kalender program promo diskon musiman, paket combo hemat hari kerja (Weekday Lunch Promo), promo ulang tahun, dan loyalty reward tamu.',
          features: [
            'Kalender program promosi tahunan resto',
            'Kalkulasi simulasi diskon & dampaknya terhadap margin keuntungan',
            'Syarat & ketentuan promo terintegrasi ke kasir dan CRM blast',
            'Laporan evaluasi omzet yang dihasilkan dari masing-masing promo',
          ],
          phase: 'Phase 5 — Development & Academy',
          tags: ['Promotion', 'Diskon', 'Seasonal Festival', 'Loyalty'],
        };

      default:
        return {
          title: 'Development Module',
          desc: 'Pusat pengembangan kapasitas SDM, strategi bisnis, dan pemasaran.',
          features: ['Business Academy', 'Assessment', 'Action Plan', 'Marketing'],
          phase: 'Phase 5',
          tags: ['Development'],
        };
    }
  };

  const currentContent = getSubmoduleContent(activeSubmodule?.subParam || 'business-academy');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Submodule Navigation Tabs */}
      <div className="bg-[#1E2438] rounded-2xl border border-[#2D374E] p-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {availableSubmodules.map((sub) => {
            const isActive = sub.subParam === activeSubParam;
            return (
              <button
                key={sub.id}
                onClick={() => setSearchParams({ sub: sub.subParam })}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Placeholder */}
      <PagePlaceholder
        moduleTitle="Development"
        submoduleTitle={activeSubmodule?.name}
        description={currentContent.desc}
        plannedFeatures={currentContent.features}
        phaseTarget={currentContent.phase}
        tags={currentContent.tags}
        icon={<GraduationCap className="w-6 h-6" />}
      />
    </div>
  );
}
