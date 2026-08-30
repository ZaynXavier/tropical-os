import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import {
  Calendar,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Users,
  Utensils,
  Wine,
  Sparkles,
} from 'lucide-react-native';

const MOCK_SHIFTS = [
  { day: 'Senin', date: '25 Agt', shift: 'Pagi', time: '08:00 - 16:00', station: 'Kitchen Prep', icon: 'KITCHEN', status: 'COMPLETED' },
  { day: 'Selasa', date: '26 Agt', shift: 'Pagi', time: '08:00 - 16:00', station: 'Executive Lead', icon: 'EXEC', status: 'COMPLETED' },
  { day: 'Rabu', date: '27 Agt', shift: 'Middle', time: '11:00 - 19:00', station: 'Floor Supervisor', icon: 'FLOOR', status: 'COMPLETED' },
  { day: 'Kamis', date: '28 Agt', shift: 'Pagi', time: '08:00 - 16:00', station: 'Executive Lead', icon: 'EXEC', status: 'COMPLETED' },
  { day: 'Jumat', date: '29 Agt', shift: 'Closing', time: '15:00 - 23:00', station: 'Bar & Cashier', icon: 'BAR', status: 'COMPLETED' },
  { day: 'Sabtu', date: '30 Agt', shift: 'Pagi (Hari Ini)', time: '08:00 - 16:00', station: 'Executive Lead', icon: 'EXEC', status: 'ACTIVE' },
  { day: 'Minggu', date: '31 Agt', shift: 'Libur (OFF)', time: '—', station: 'Off Duty', icon: 'OFF', status: 'OFF' },
];

export const ScheduleScreen: React.FC = () => {
  const [shifts] = useState(MOCK_SHIFTS);

  const handleRequestSwap = (day: string) => {
    Alert.alert(
      'Ajukan Tukar Shift',
      `Pilih rekan kerja untuk mengajukan penukaran jadwal shift hari ${day}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kirim Permintaan',
          onPress: () =>
            Alert.alert('Terkirim ✨', 'Pengajuan tukar shift berhasil dikirim ke Supervisor untuk persetujuan 1-klik.'),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Calendar size={22} color={COLORS.primaryGlow} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Jadwal Roster Shift Restoran</Text>
            <Text style={styles.headerSub}>Periode: 25 - 31 Agustus 2026 • 6 Hari Masuk</Text>
          </View>
        </View>

        <View style={styles.infoPillBox}>
          <Sparkles size={14} color={COLORS.emerald} />
          <Text style={styles.infoPillText}>
            Fitur Tukar Shift Otomatis: Tekan tombol panah di kanan shift untuk bertukar jadwal.
          </Text>
        </View>
      </View>

      {/* Shifts List */}
      <View style={styles.listContainer}>
        {shifts.map((item, index) => {
          const isOff = item.status === 'OFF';
          const isActive = item.status === 'ACTIVE';

          return (
            <View
              key={index}
              style={[
                styles.shiftCard,
                isActive && styles.activeShiftCard,
                isOff && styles.offShiftCard,
              ]}
            >
              <View style={styles.dateCol}>
                <Text style={[styles.dayText, isActive && { color: COLORS.emerald }]}>{item.day}</Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailCol}>
                <View style={styles.shiftHeaderRow}>
                  <Text
                    style={[
                      styles.shiftName,
                      isOff && { color: COLORS.textDim },
                      isActive && { color: COLORS.emerald, fontWeight: '900' },
                    ]}
                  >
                    {item.shift}
                  </Text>
                  {isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Hari Ini</Text>
                    </View>
                  )}
                </View>

                <View style={styles.timeRow}>
                  <Clock size={12} color={COLORS.textMuted} />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={styles.stationText}>Penugasan: {item.station}</Text>
              </View>

              {!isOff && (
                <TouchableOpacity
                  onPress={() => handleRequestSwap(item.day)}
                  style={styles.swapBtn}
                  accessibilityLabel="Tukar Shift"
                >
                  <ArrowRightLeft size={16} color={COLORS.primaryGlow} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
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
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  infoPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 14,
    padding: 10,
    marginTop: 14,
  },
  infoPillText: {
    flex: 1,
    fontSize: 11,
    color: '#6EE7B7',
    lineHeight: 15,
  },
  listContainer: {
    gap: 10,
  },
  shiftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  activeShiftCard: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  offShiftCard: {
    opacity: 0.6,
  },
  dateCol: {
    width: 65,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 38,
    backgroundColor: COLORS.cardBorder,
    marginHorizontal: 12,
  },
  detailCol: {
    flex: 1,
  },
  shiftHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shiftName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  activeBadge: {
    backgroundColor: COLORS.emeraldBg,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.emerald,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  stationText: {
    fontSize: 10,
    color: COLORS.textDim,
    marginTop: 2,
  },
  swapBtn: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: COLORS.cardSecondary,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
});
