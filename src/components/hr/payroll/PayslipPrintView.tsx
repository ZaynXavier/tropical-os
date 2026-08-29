/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Payslip Print Layout
 * Clean, printable payslip format designed for standard paper / PDF export
 */

import React from 'react';
import { Payslip } from '../../../types/payroll';
import { formatCurrency, formatDate } from '../../../services/payrollService';

interface PayslipPrintViewProps {
  payslip: Payslip;
}

export const PayslipPrintView: React.FC<PayslipPrintViewProps> = ({ payslip }) => {
  return (
    <div className="bg-white text-gray-900 p-8 rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto font-sans print:border-none print:shadow-none print:p-0 print:m-0">
      {/* Restaurant Header */}
      <div className="border-b-2 border-emerald-800 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-emerald-900 tracking-tight">
            TROPICAL GARDEN RESTO
          </h1>
          <p className="text-xs text-gray-600">
            Sistem Operasional Terpadu (TropicalOS) • PT Tropical Garden Nusantara
          </p>
          <p className="text-[11px] text-gray-500">
            Kawasan Wisata Kuliner, Yogyakarta, Indonesia
          </p>
        </div>

        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              payslip.status === 'Final'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            SLIP GAJI {payslip.status === 'Final' ? 'FINAL' : 'SIMULASI PREVIEW'}
          </span>
          <p className="text-xs font-bold text-gray-800 mt-1">Periode: {payslip.periodName}</p>
          <p className="text-[10px] text-gray-500 font-mono">No: {payslip.payslipId}</p>
        </div>
      </div>

      {/* Employee Metadata */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-gray-200 text-xs">
        <div className="space-y-1">
          <div className="flex">
            <span className="w-28 text-gray-500">Kode Pegawai:</span>
            <span className="font-bold text-gray-900 font-mono">{payslip.employeeCode}</span>
          </div>
          <div className="flex">
            <span className="w-28 text-gray-500">Nama Lengkap:</span>
            <span className="font-bold text-gray-900">{payslip.employeeName}</span>
          </div>
          <div className="flex">
            <span className="w-28 text-gray-500">Departemen:</span>
            <span className="text-gray-900">{payslip.department}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex">
            <span className="w-28 text-gray-500">Jabatan:</span>
            <span className="font-bold text-gray-900">{payslip.position}</span>
          </div>
          <div className="flex">
            <span className="w-28 text-gray-500">Tanggal Gabung:</span>
            <span className="text-gray-900">{formatDate(payslip.joinDate)}</span>
          </div>
          <div className="flex">
            <span className="w-28 text-gray-500">Metode Bayar:</span>
            <span className="text-gray-700">{payslip.bankAccount || 'Transfer Rekening Bank'}</span>
          </div>
        </div>
      </div>

      {/* Operational Summary Strip */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 my-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="text-[10px] text-gray-500">Hari Hadir Operasional</p>
          <p className="font-bold text-emerald-800">{payslip.presentDays} Hari</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">Keterlambatan</p>
          <p className="font-bold text-gray-800">{payslip.lateMinutes} Menit</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">Lembur Disetujui (SPL)</p>
          <p className="font-bold text-amber-800">{payslip.approvedOvertimeHours} Jam</p>
        </div>
      </div>

      {/* 2-Column Earnings & Deductions Breakdown Table */}
      <div className="grid grid-cols-2 gap-6 my-4 text-xs">
        {/* Earnings */}
        <div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-t-lg font-bold text-emerald-900">
            PENERIMAAN (EARNINGS)
          </div>
          <div className="border border-t-0 border-gray-200 divide-y divide-gray-100 rounded-b-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Gaji Pokok</span>
              <span className="font-bold text-gray-900">{formatCurrency(payslip.basicSalary)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-600">Tunjangan Makan</span>
              <span className="text-gray-900">{formatCurrency(payslip.mealAllowance)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-600">Tunjangan Transport</span>
              <span className="text-gray-900">{formatCurrency(payslip.transportAllowance)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-600">Tunjangan Jabatan</span>
              <span className="text-gray-900">{formatCurrency(payslip.positionAllowance)}</span>
            </div>
            {payslip.otherAllowance > 0 && (
              <div className="flex justify-between pt-1">
                <span className="text-gray-600">Tunjangan Lainnya</span>
                <span className="text-gray-900">{formatCurrency(payslip.otherAllowance)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-gray-600">Upah Lembur Disetujui</span>
              <span className="font-semibold text-emerald-800">
                {formatCurrency(payslip.overtimePay)}
              </span>
            </div>
            {payslip.otherEarnings > 0 && (
              <div className="flex justify-between pt-1">
                <span className="text-gray-600">Bonus & Penyesuaian</span>
                <span className="font-semibold text-emerald-800">
                  +{formatCurrency(payslip.otherEarnings)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t-2 border-gray-200 font-bold text-gray-900">
              <span>Total Penerimaan Kotor</span>
              <span className="text-emerald-900">{formatCurrency(payslip.grossSalary)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-t-lg font-bold text-rose-900">
            POTONGAN (DEDUCTIONS)
          </div>
          <div className="border border-t-0 border-gray-200 divide-y divide-gray-100 rounded-b-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Potongan Keterlambatan</span>
              <span className="text-gray-900">
                {payslip.lateDeduction > 0 ? `-${formatCurrency(payslip.lateDeduction)}` : 'Rp 0'}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-600">Potongan Ketidakhadiran</span>
              <span className="text-gray-900">
                {payslip.absenceDeduction > 0 ? `-${formatCurrency(payslip.absenceDeduction)}` : 'Rp 0'}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-600">Potongan Kasbon</span>
              <span className="font-semibold text-rose-700">
                {payslip.advanceDeduction > 0 ? `-${formatCurrency(payslip.advanceDeduction)}` : 'Rp 0'}
              </span>
            </div>
            {payslip.otherDeductions > 0 && (
              <div className="flex justify-between pt-1">
                <span className="text-gray-600">Potongan Lainnya</span>
                <span className="font-semibold text-rose-700">
                  -{formatCurrency(payslip.otherDeductions)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t-2 border-gray-200 font-bold text-gray-900">
              <span>Total Pemotongan</span>
              <span className="text-rose-700">-{formatCurrency(payslip.totalDeductions)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Salary Box */}
      <div className="bg-emerald-800 text-white rounded-xl p-4 my-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
            TOTAL GAJI BERSIH (TAKE HOME PAY)
          </p>
          <p className="text-[11px] text-emerald-100">
            Ditransfer ke rekening terdaftar karyawan
          </p>
        </div>
        <div className="text-2xl font-black tracking-tight">
          {formatCurrency(payslip.netSalary)}
        </div>
      </div>

      {/* Signatures & Footer */}
      <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-gray-200 text-xs text-center">
        <div className="space-y-12">
          <p className="text-gray-600">Penerima,</p>
          <div>
            <p className="font-bold text-gray-900 uppercase underline">{payslip.employeeName}</p>
            <p className="text-[10px] text-gray-500">{payslip.position}</p>
          </div>
        </div>

        <div className="space-y-12">
          <p className="text-gray-600">Dikeluarkan Oleh,</p>
          <div>
            <p className="font-bold text-gray-900 uppercase underline">Heri Setiawan</p>
            <p className="text-[10px] text-gray-500">General Manager / HR</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-3 border-t border-gray-100 text-center text-[10px] text-gray-400">
        Dokumen ini merupakan slip gaji resmi yang diterbitkan oleh sistem TropicalOS • Dicetak pada {new Date().toLocaleDateString('id-ID')}
      </div>
    </div>
  );
};
