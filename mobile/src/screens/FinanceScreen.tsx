import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import {
  FileText,
  CreditCard,
  Download,
  CheckCircle2,
  DollarSign,
  Plus,
  X,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react-native';

export const FinanceScreen: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');

  const formatCurrency = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const handleApplyAdvance = () => {
    if (!advanceAmount || isNaN(Number(advanceAmount))) {
      Alert.alert('Perhatian', 'Masukkan nominal kasbon yang valid.');
      return;
    }

    const num = Number(advanceAmount);
    if (num > 5000000) {
      Alert.alert('Batas Kasbon Terlampaui', 'Maksimal pengajuan kasbon adalah Rp 5.000.000 (40% dari estimasi gaji berjalan).');
      return;
    }

    setIsModalOpen(false);
    setAdvanceAmount('');
    setAdvanceReason('');
    Alert.alert('Pengajuan Berhasil ✨', 'Kasbon sebesar ' + formatCurrency(num) + ' berhasil diajukan dan otomatis masuk ke antrean approval Finance.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Banner: Salary & Advance Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summarySub}>ESTIMASI GAJI BERJALAN (AGUSTUS 2026)</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>Aktif</Text>
          </View>
        </View>

        <Text style={styles.summaryAmount}>{formatCurrency(12450000)}</Text>
        
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Presensi</Text>
            <Text style={styles.kpiValue}>24 Shift</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Lembur (SPL)</Text>
            <Text style={styles.kpiValue}>8 Jam</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Potongan Kasbon</Text>
            <Text style={styles.kpiValue}>Rp 0</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.applyBtn}>
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.applyBtnText}>+ Ajukan Kasbon (Early Wage Access)</Text>
        </TouchableOpacity>
      </View>

      {/* Payslip History Section */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FileText size={18} color={COLORS.primaryGlow} />
          <Text style={styles.sectionTitle}>Riwayat Slip Gaji Digital</Text>
        </View>
        <Text style={styles.sectionSub}>Otomatis dikunci PIN Karyawan</Text>
      </View>

      <View style={styles.payslipList}>
        {[
          { period: 'Juli 2026', total: 12250000, date: '28 Jul 2026', status: 'DITRANSFER' },
          { period: 'Juni 2026', total: 12100000, date: '28 Jun 2026', status: 'DITRANSFER' },
          { period: 'Mei 2026', total: 12400000, date: '28 Mei 2026', status: 'DITRANSFER' },
        ].map((item, index) => (
          <View key={index} style={styles.payslipCard}>
            <View style={styles.payslipIcon}>
              <FileText size={20} color={COLORS.emerald} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.payslipPeriod}>{item.period}</Text>
              <Text style={styles.payslipDate}>{item.date} • {item.status}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.payslipAmount}>{formatCurrency(item.total)}</Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Unduh Slip Gaji', 'Slip Gaji resmi periode ' + item.period + ' berhasil diunduh ke memori HP.')}
                style={styles.downloadBtn}
              >
                <Download size={12} color={COLORS.primaryGlow} />
                <Text style={styles.downloadText}>Unduh PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Salary Advance Request Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CreditCard size={20} color={COLORS.primaryGlow} />
                <Text style={styles.modalTitle}>Pengajuan Kasbon Darurat</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Batas limit kasbon: <Text style={{ color: COLORS.emerald, fontWeight: 'bold' }}>Rp 5.000.000</Text> (40% estimasi gaji berjalan).
            </Text>

            <Text style={styles.inputLabel}>Nominal Kasbon (Rp):</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="Contoh: 1500000"
              placeholderTextColor="#6B7280"
              value={advanceAmount}
              onChangeText={setAdvanceAmount}
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Keperluan / Alasan:</Text>
            <TextInput
              placeholder="Contoh: Keperluan darurat keluarga"
              placeholderTextColor="#6B7280"
              value={advanceReason}
              onChangeText={setAdvanceReason}
              style={[styles.textInput, { height: 75 }]}
              multiline
            />

            <TouchableOpacity onPress={handleApplyAdvance} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>Kirim Pengajuan Kasbon</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  summaryCard: {
    backgroundColor: '#0F182A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summarySub: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primaryGlow,
    letterSpacing: 0.5,
  },
  statusPill: {
    backgroundColor: COLORS.emeraldBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.emerald,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 6,
    letterSpacing: -0.5,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    marginBottom: 16,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  kpiLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  kpiValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.emerald,
    marginTop: 2,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  payslipList: {
    gap: 10,
  },
  payslipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  payslipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.emeraldBg,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payslipPeriod: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  payslipDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  payslipAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  downloadText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primaryGlow,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#111728',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.cardSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    color: COLORS.text,
    padding: 12,
    fontSize: 13,
    marginBottom: 14,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
