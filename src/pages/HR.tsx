import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MASTER_NAVIGATION } from '../config/navigation';
import { PagePlaceholder } from '../components/common/PagePlaceholder';
import { HRCommandCenterView } from '../components/hr/dashboard/HRCommandCenterView';
import { TopicalHrDashboardView } from '../components/hr/dashboard/TopicalHrDashboardView';
import { EmployeeManagementView } from '../components/hr/employees/EmployeeManagementView';
import { OrganizationStructureView } from '../components/hr/organization/OrganizationStructureView';
import { AttendanceView } from '../components/hr/attendance/AttendanceView';
import { ShiftScheduleModuleView } from '../components/hr/ShiftScheduleModuleView';
import { BreakManagementView } from '../components/hr/BreakManagementView';
import { OvertimeManagementView } from '../components/hr/OvertimeManagementView';
import { HRConfigurationView } from '../components/hr/HRConfigurationView';
import { PayrollDashboardView } from '../components/hr/payroll/PayrollDashboardView';
import { HRDocumentManagementView } from '../components/hr/documents/HRDocumentManagementView';
import { SopManagementView } from '../components/hr/sop/SopManagementView';
import { JobDescriptionManagementView } from '../components/hr/jobDescription/JobDescriptionManagementView';
import { IkaManagementView } from '../components/hr/ika/IkaManagementView';
import { ChecklistKpiView } from '../components/hr/ChecklistKpiView';
import { KpiPerformanceDashboardView } from '../components/hr/KpiPerformanceDashboardView';
import { HRReportsDashboardView } from '../components/hr/reports/HRReportsDashboardView';
import { Users, Calendar, Clock, Coffee, FileText, Award, DollarSign, BookOpen, Layers, Settings } from 'lucide-react';
import { permissionService } from '../services/permissionService';

export default function HR() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const hrModule = MASTER_NAVIGATION.find((m) => m.id === 'hr');

  // Filter submodules by RBAC
  const availableSubmodules = (hrModule?.submodules || []).filter((sub) =>
    permissionService.canViewSubmodule(currentUser, 'hr', sub)
  );

  const defaultSub = currentUser?.accessLevel === 'STAFF' ? 'shifts' : (availableSubmodules[0]?.subParam || 'dashboard');
  const requestedSub = searchParams.get('sub');
  
  // Verify requested submodule is within allowed list for current user
  const isRequestedAllowed = requestedSub && availableSubmodules.some((s) => s.subParam === requestedSub);
  const activeSubParam = isRequestedAllowed ? requestedSub : (availableSubmodules.some((s) => s.subParam === defaultSub) ? defaultSub : (availableSubmodules[0]?.subParam || 'shifts'));
  const activeSubmodule = availableSubmodules.find((s) => s.subParam === activeSubParam) || availableSubmodules[0];

  const getSubmoduleContent = (param: string) => {
    switch (param) {
      case 'attendance':
        return {
          title: 'Attendance & Clock-In Portal',
          desc: 'Pencatatan absensi real-time masuk & pulang shift dengan validasi foto selfie, titik GPS resto, dan status ketepatan waktu.',
          features: [
            'Clock-In & Clock-Out berbasis GPS geofencing radius resto (Frontend Mock)',
            'Capture foto selfie verifikasi kehadiran',
            'Pencatatan otomatis status Masuk, Terlambat, Izin, Sakit, atau Alpha',
            'Log rekapitulasi jam kerja aktual per karyawan',
          ],
          phase: 'Phase 2B — Attendance & Shifts',
          tags: ['Presensi', 'GPS', 'Clock-in', 'Realtime Attendance'],
        };

      case 'shifts':
        return {
          title: 'Shift & Roster Schedule',
          desc: 'Penyusunan jadwal kerja mingguan, pembagian shift (Pagi, Siang, Middle, Closing), dan permintaan tukar jadwal antar staf.',
          features: [
            'Kalender jadwal shift mingguan dan bulanan multi-departemen',
            'Pengajuan tukar shift (Shift Swap) dengan verifikasi supervisor',
            'Notifikasi pengingat jadwal shift mendatang',
            'Monitoring headcount minimum per stasiun saat jam sibuk',
          ],
          phase: 'Phase 2B — Attendance & Shifts',
          tags: ['Shift', 'Roster', 'Schedule', 'Calendar'],
        };

      case 'breaks':
        return {
          title: 'Break Request & Tracking',
          desc: 'Pengajuan waktu istirahat (Standard Break & Additional Break) dengan timer durasi otomatis dan persetujuan supervisor.',
          features: [
            'Pengajuan Standard Break (Istirahat makan/ibadah reguler)',
            'Pengajuan Additional Break disertai alasan operasional',
            'Timer countdown istirahat aktif untuk memastikan ketertiban lantai resto',
            'Approval cepat 1-klik oleh Supervisor shift terkait',
          ],
          phase: 'Phase 2C.3 — Break Management',
          tags: ['Break', 'Timer', 'Approval', 'Disiplin'],
        };

      case 'overtime':
        return {
          title: 'Overtime Management & SPL',
          desc: 'Pengajuan Surat Perintah Lembur (SPL), approval workflow, pencatatan jam aktual & estimasi payroll lembur.',
          features: [
            'Pengajuan Lembur Pre-Shift, Post-Shift, Off-Day, dan Event Banquet',
            'Validasi tabrakan jadwal shift & deteksi excess overtime',
            'Otorisasi bertingkat SPV & Manager dengan catatan instruksi',
            'Simulasi biaya lembur dan integrasi kalkulasi payroll',
          ],
          phase: 'Phase 2C.4 — Overtime Management',
          tags: ['Lembur', 'SPL', 'Overtime', 'Payroll', 'Audit Trail'],
        };

      case 'configuration':
        return {
          title: 'HR Configuration & Shift Rules',
          desc: 'Pusat pengaturan Master Shift, presensi & toleransi keterlambatan, titik koordinat GPS geofence, kuota istirahat, dan simulasi lembur.',
          features: [
            'Master Shifts & Dynamic Working Hours Parameterization',
            'Grace Period & Real-time Late Deduction Formula Calculator',
            'Restaurant Location Coordinates & GPS Accuracy Geofence Thresholds',
            'Standard & Additional Break Quota & Overbreak Alert Triggers',
            'Flat Overtime Rate Configuration & Payroll Integration Contract',
          ],
          phase: 'Phase 2C.5 — HR Configuration & Shift Rules',
          tags: ['HR Settings', 'Shifts', 'Geofence', 'Grace Period', 'Payroll Contract'],
        };

      case 'payroll':
        return {
          title: 'Payroll & Slip Gaji Mandiri',
          desc: 'Perhitungan gaji pokok, tunjangan kehadiran, lembur, potongan keterlambatan, dan penerbitan slip gaji digital.',
          features: [
            'Rekapitulasi otomatis jam kerja & presensi ke slip gaji',
            'Kalkulasi tunjangan makan, transport, dan insentif pencapaian omzet',
            'Akses unduh slip gaji PDF mandiri oleh masing-masing staf (OWN scope)',
            'Approval final payroll oleh Owner & Finance Officer',
          ],
          phase: 'Phase 4 — Finance & Payroll',
          tags: ['Payroll', 'Slip Gaji', 'Salary', 'Tax & Deductions'],
        };

      case 'sop':
        return {
          title: 'Standard Operating Procedure (SOP)',
          desc: 'Pusat panduan resmi standar kualitas pelayanan, kebersihan dapur, standar penampilan, dan etika kerja Tropical Garden Resto.',
          features: [
            'Katalog SOP digital terkategorisasi (Kitchen, Bar, Service, Cleaning)',
            'Fitur konfirmasi "Telah Membaca & Memahami SOP" oleh karyawan',
            'Pencarian cerdas langkah SOP dan filter cepat',
            'Riwayat revisi dan pembaruan dokumen SOP resto',
          ],
          phase: 'Phase 3 — SOP & IKA',
          tags: ['SOP', 'Standard', 'Guidelines', 'Hygiene'],
        };

      case 'job-description':
        return {
          title: 'Job Description',
          desc: 'Rincian tugas pokok, wewenang, dan tanggung jawab kerja spesifik untuk masing-masing 24 posisi di resto.',
          features: [
            'Daftar rincian tugas pokok harian per jabatan',
            'Batasan wewenang dan eskalasi penanganan komplain',
            'Indikator keberhasilan harian masing-masing peran',
            'Penyelarasan jobdesc dengan modul evaluasi KPI',
          ],
          phase: 'Phase 3 — SOP & IKA',
          tags: ['Jobdesc', 'Responsibilities', 'Roles', 'Station'],
        };

      case 'ika':
        return {
          title: 'Instruksi Kerja Alat (IKA)',
          desc: 'Panduan teknis pengoperasian, keselamatan kerja, perawatan berkala, dan pembersihan peralatan mesin dapur dan bar.',
          features: [
            'Panduan langkah demi langkah penggunaan mesin espresso, chiller, fryer, combi oven, dan POS',
            'Prosedur keselamatan kerja dan penanganan bahaya listrik/gas',
            'Jadwal sanitasi & pemeliharaan berkala alat',
            'Dokumentasi visual panduan pemakaian alat',
          ],
          phase: 'Phase 3 — SOP & IKA',
          tags: ['IKA', 'Equipment', 'Safety', 'Maintenance'],
        };

      case 'checklist':
        return {
          title: 'Checklist HR & Penilaian Lapangan',
          desc: 'Daftar audit berkala kepatuhan seragam, kebersihan personal, kartu identitas, dan kedisiplinan kerja staf.',
          features: [
            'Audit kepatuhan atribut standar grooming dan hygiene',
            'Evaluasi keaktifan tim saat briefing harian',
            'Skoring audit berkala dan catatan pembinaan',
            'Rekapitulasi temuan audit langsung ke dashboard manajer',
          ],
          phase: 'Phase 3 — SOP & IKA',
          tags: ['Audit', 'Grooming', 'Checklist HR', 'Disiplin'],
        };

      case 'kpi':
        return {
          title: 'KPI Personal & Evaluasi Kinerja',
          desc: 'Indikator performa kuantitatif dan kualitatif karyawan, skor kehadiran, kepatuhan SOP, dan feedback atasan.',
          features: [
            'Kartu nilai KPI bulanan per karyawan dengan target terukur',
            'Poin penilaian dari ketepatan waktu, kebersihan, dan nihil komplain',
            'Review berkala oleh Head Kitchen / Supervisor / Manager',
            'Histori perkembangan skor KPI untuk dasar promosi dan bonus',
          ],
          phase: 'Phase 5 — KPI & Development',
          tags: ['KPI', 'Evaluation', 'Performance', 'Scorecard'],
        };

      case 'documents':
        return {
          title: 'HR Documents & Contracts',
          desc: 'Arsip digital dokumen kepegawaian, surat perjanjian kerja, sertifikasi hygiene resto, dan surat peringatan.',
          features: [
            'Penyimpanan digital berkas kontrak kerja karyawan',
            'Pengingat masa berlaku sertifikasi & kontrak',
            'Arsip surat keputusan internal dan memo direksi',
            'Download formulir permohonan izin & cuti',
          ],
          phase: 'Phase 2A / Future',
          tags: ['Documents', 'Contracts', 'Arsip', 'Files'],
        };

      case 'reports':
        return {
          title: 'HR Reports & Analytics',
          desc: 'Laporan komprehensif tingkat kehadiran, rasio keterlambatan, utilisasi jam kerja, dan turnover karyawan.',
          features: [
            'Grafik tren kehadiran dan keterlambatan bulanan',
            'Laporan perbandingan biaya lembur per divisi',
            'Analisa produktivitas tenaga kerja terhadap jam sibuk resto',
            'Ekspor laporan presensi ke format Excel / PDF',
          ],
          phase: 'Phase 2B / Reports',
          tags: ['Reports', 'Analytics', 'Summary', 'Turnover'],
        };

      default:
        return {
          title: 'Tropical HR Module',
          desc: 'Modul manajemen sumber daya manusia Tropical Garden Resto.',
          features: ['Manajemen Karyawan', 'Presensi & Shift', 'SOP & IKA', 'Evaluasi KPI'],
          phase: 'Phase 2',
          tags: ['HR'],
        };
    }
  };

  const currentContent = getSubmoduleContent(activeSubmodule?.subParam || 'employees');

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

      {/* RENDER ACTIVE SUBMODULE */}
      {activeSubParam === 'dashboard' && <TopicalHrDashboardView />}
      {activeSubParam === 'employees' && <EmployeeManagementView />}
      {activeSubParam === 'organization' && <OrganizationStructureView />}
      {activeSubParam === 'attendance' && <AttendanceView />}
      {activeSubParam === 'shifts' && <ShiftScheduleModuleView />}
      {activeSubParam === 'breaks' && <BreakManagementView />}
      {activeSubParam === 'overtime' && <OvertimeManagementView />}
      {activeSubParam === 'configuration' && <HRConfigurationView />}
      {activeSubParam === 'payroll' && (
        <PayrollDashboardView
          currentUserId={currentUser?.id}
          userRole={currentUser?.accessLevel || 'MANAGER'}
        />
      )}
      {activeSubParam === 'sop' && (
        <SopManagementView currentUser={currentUser} />
      )}
      {activeSubParam === 'job-description' && (
        <JobDescriptionManagementView currentUser={currentUser} />
      )}
      {activeSubParam === 'ika' && (
        <IkaManagementView currentUser={currentUser} />
      )}
      {activeSubParam === 'checklist' && (
        <ChecklistKpiView
          user={{
            id: currentUser?.id || 'emp-current',
            name: currentUser?.name || currentUser?.fullName || 'Staff Resto',
            role: (currentUser?.accessLevel as any) || 'STAFF',
            division: currentUser?.department || 'KITCHEN',
            email: currentUser?.email || 'staff@tropicalresto.com',
            position: (currentUser as any)?.primaryPosition || 'Staff',
          } as any}
          initialTab="checklist_dashboard"
        />
      )}
      {activeSubParam === 'kpi' && (
        <KpiPerformanceDashboardView
          user={{
            id: currentUser?.id || 'emp-current',
            name: currentUser?.name || currentUser?.fullName || 'Staff Resto',
            role: (currentUser?.accessLevel as any) || 'STAFF',
            division: currentUser?.department || 'KITCHEN',
            email: currentUser?.email || 'staff@tropicalresto.com',
            position: (currentUser as any)?.primaryPosition || 'Staff',
          } as any}
        />
      )}
      {activeSubParam === 'documents' && (
        <HRDocumentManagementView currentUser={currentUser} />
      )}
      {activeSubParam === 'reports' && (
        <HRReportsDashboardView
          userRole={currentUser?.accessLevel || 'MANAGER'}
          currentUserId={currentUser?.id}
        />
      )}

      {/* Placeholders for future phases as mandated */}
      {activeSubParam !== 'dashboard' &&
        activeSubParam !== 'employees' &&
        activeSubParam !== 'organization' &&
        activeSubParam !== 'attendance' &&
        activeSubParam !== 'shifts' &&
        activeSubParam !== 'breaks' &&
        activeSubParam !== 'overtime' &&
        activeSubParam !== 'configuration' &&
        activeSubParam !== 'payroll' &&
        activeSubParam !== 'sop' &&
        activeSubParam !== 'job-description' &&
        activeSubParam !== 'ika' &&
        activeSubParam !== 'checklist' &&
        activeSubParam !== 'kpi' &&
        activeSubParam !== 'documents' &&
        activeSubParam !== 'reports' && (
          <PagePlaceholder
            moduleTitle="Tropical HR"
            submoduleTitle={activeSubmodule?.name}
            description={currentContent.desc}
            plannedFeatures={currentContent.features}
            phaseTarget={currentContent.phase}
            tags={currentContent.tags}
            icon={<Users className="w-6 h-6" />}
          />
        )}
    </div>
  );
}
