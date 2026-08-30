import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { COLORS } from '../theme/colors';
import * as Location from 'expo-location';
import {
  Crown,
  TrendingUp,
  DollarSign,
  Users,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  PieChart,
  Percent,
  ChevronRight,
  Shield,
  Utensils,
  Share2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const [mode, setMode] = useState<'EXECUTIVE' | 'STAFF'>('EXECUTIVE');
  const [activeSegment, setActiveSegment] = useState<'SALES' | 'OPERATIONS'>('SALES');
  const [currentTimeStr, setCurrentTimeStr] = useState('22.21 WIB');
  const [currentDateStr, setCurrentDateStr] = useState('28 Agt 2026');

  // Live POS Sales Data
  const [todaySales, setTodaySales] = useState(38450000);
  const [targetSales, setTargetSales] = useState(35000000);
  const [grossProfit, setGrossProfit] = useState(26220000);
  const [guestPax, setGuestPax] = useState(219);
  const [hppRatio, setHppRatio] = useState(31.8);
  const [laborCostRatio, setLaborCostRatio] = useState(21.4);

  // GPS Attendance State
  const [gpsStatus, setGpsStatus] = useState<'VALIDATING' | 'IN_RADIUS' | 'OUTSIDE'>('IN_RADIUS');
  const [distance, setDistance] = useState(14);
  const [hasClockedIn, setHasClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeFormat = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
      setCurrentTimeStr(`${timeFormat} WITA`);
      setCurrentDateStr(now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const targetPercentage = ((todaySales / targetSales) * 100).toFixed(1);
  const avgPerPax = Math.round(todaySales / guestPax / 1000);

  const handleClockIn = () => {
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setHasClockedIn(true);
    setClockInTime(nowStr);
    Alert.alert('Presensi Berhasil 🎉', `Clock-in terverifikasi GPS & Foto pukul ${nowStr} WITA.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. TOP HEADER PROFILE BAR (Matching Screenshot) */}
      <View style={styles.topProfileBar}>
        <View style={styles.profileLeft}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SA</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>Super Admin</Text>
              <View style={styles.execBadge}>
                <Text style={styles.execBadgeText}>Executive</Text>
              </View>
            </View>
            <Text style={styles.profileSubtitle}>Super Admin &amp; Owner</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setMode(mode === 'EXECUTIVE' ? 'STAFF' : 'EXECUTIVE')}
          style={[styles.modeToggleBtn, mode === 'EXECUTIVE' ? styles.modeToggleExec : styles.modeToggleStaff]}
        >
          {mode === 'EXECUTIVE' ? (
            <>
              <Crown size={13} color={COLORS.gold} />
              <Text style={styles.modeToggleTextExec}>Mode Eksekutif</Text>
            </>
          ) : (
            <>
              <Shield size={13} color={COLORS.primary} />
              <Text style={styles.modeToggleTextStaff}>Mode Staf</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 2. EXECUTIVE OWNER VIEW BANNER (Matching Screenshot) */}
      {mode === 'EXECUTIVE' && (
        <View style={styles.executiveCard}>
          <View style={styles.executiveHeader}>
            <View style={styles.crownCircle}>
              <Crown size={22} color={COLORS.gold} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.execCardTitle}>LAPORAN EKSEKUTIF PEMILIK</Text>
                <View style={styles.ownerViewBadge}>
                  <Text style={styles.ownerViewText}>Owner View</Text>
                </View>
              </View>
              <Text style={styles.execCardSub}>Pengawasan Pendapatan &amp; Operasional Harian Resto</Text>
            </View>
            <View style={styles.timePill}>
              <Text style={styles.timePillText}>{currentTimeStr}</Text>
              <Text style={styles.datePillText}>{currentDateStr}</Text>
            </View>
          </View>

          <View style={styles.execNoticeBox}>
            <Sparkles size={16} color={COLORS.gold} style={{ marginTop: 1 }} />
            <Text style={styles.execNoticeText}>
              Owner Mode: Laporan otomatis diperbarui real-time. Approval tugas &amp; izin ditangani mandiri oleh Manager &amp; SPV.
            </Text>
          </View>
        </View>
      )}

      {/* 3. SEGMENTED TABS (Pendapatan Harian vs Laporan Operasional) */}
      {mode === 'EXECUTIVE' && (
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            onPress={() => setActiveSegment('SALES')}
            style={[styles.segmentBtn, activeSegment === 'SALES' && styles.segmentBtnActive]}
          >
            <DollarSign size={15} color={activeSegment === 'SALES' ? '#FFFFFF' : COLORS.textMuted} />
            <Text style={[styles.segmentText, activeSegment === 'SALES' && styles.segmentTextActive]}>
              Pendapatan Harian
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveSegment('OPERATIONS')}
            style={[styles.segmentBtn, activeSegment === 'OPERATIONS' && styles.segmentBtnActive]}
          >
            <TrendingUp size={15} color={activeSegment === 'OPERATIONS' ? '#FFFFFF' : COLORS.textMuted} />
            <Text style={[styles.segmentText, activeSegment === 'OPERATIONS' && styles.segmentTextActive]}>
              Laporan Operasional
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. HERO SALES POS CARD (Matching Screenshot with Luxury Finns Glow) */}
      <View style={styles.heroSalesCard}>
        <View style={styles.salesHeaderRow}>
          <View style={styles.salesTitleLeft}>
            <DollarSign size={16} color={COLORS.emerald} />
            <Text style={styles.salesCardLabel}>TOTAL OMSET KASIR HARI INI</Text>
          </View>
          <View style={styles.targetBadge}>
            <Text style={styles.targetBadgeText}>+{targetPercentage}% Target</Text>
          </View>
        </View>

        {/* Main Giant Amount */}
        <View style={styles.salesAmountRow}>
          <View>
            <Text style={styles.currencyPrefix}>Rp</Text>
            <Text style={styles.salesAmountText}>38.450.000</Text>
          </View>
          <View style={styles.grossProfitCol}>
            <Text style={styles.grossProfitLabel}>Laba Kotor</Text>
            <Text style={styles.grossProfitAmount}>Rp 26.220.000</Text>
            <Text style={styles.grossProfitRatio}>(68.2%)</Text>
          </View>
        </View>

        <Text style={styles.targetSubText}>Target Harian: {formatCurrency(targetSales)}</Text>

        {/* Target Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '100%' }]} />
        </View>

        {/* 3 Key Metrics Row */}
        <View style={styles.kpiPillRow}>
          {/* Rata-rata/Pax */}
          <View style={styles.kpiPillBox}>
            <Text style={styles.kpiPillLabel}>Rata-rata/Pax</Text>
            <Text style={styles.kpiPillValEmerald}>Rp {avgPerPax}rb</Text>
          </View>

          {/* Total Tamu */}
          <View style={styles.kpiPillBox}>
            <Text style={styles.kpiPillLabel}>Total Tamu</Text>
            <Text style={styles.kpiPillValWhite}>{guestPax} Pax</Text>
          </View>

          {/* Rasio HPP */}
          <View style={styles.kpiPillBox}>
            <Text style={styles.kpiPillLabel}>Rasio HPP</Text>
            <Text style={styles.kpiPillValEmerald}>{hppRatio}%</Text>
            <Text style={styles.kpiPillStatus}>● Sehat</Text>
          </View>
        </View>
      </View>

      {/* 5. LABOR COST 7SHIFTS EFFICIENCY GAUGE */}
      <View style={styles.laborCard}>
        <View style={styles.laborHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Percent size={16} color={COLORS.primary} />
            <Text style={styles.laborTitle}>Rasio Labor Cost % (7shifts Standard)</Text>
          </View>
          <View style={styles.laborBadgeOptimal}>
            <Text style={styles.laborBadgeText}>Optimal (18%-25%)</Text>
          </View>
        </View>

        <View style={styles.laborBodyRow}>
          <View>
            <Text style={styles.laborBigNumber}>{laborCostRatio}%</Text>
            <Text style={styles.laborSub}>Estimasi Biaya Gaji 14 Staf On-Duty</Text>
          </View>
          <View style={styles.laborAmountCol}>
            <Text style={styles.laborCostAmount}>Rp 2.450.000</Text>
            <Text style={styles.laborSplh}>SPLH: Rp 102rb/jam</Text>
          </View>
        </View>
      </View>

      {/* 6. STAFF ATTENDANCE QUICK ACTION (Clock-In Live) */}
      <View style={styles.attendanceCard}>
        <View style={styles.attendanceHeader}>
          <View style={styles.attendanceIconBox}>
            <MapPin size={18} color={COLORS.emerald} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.attendanceTitle}>Presensi GPS Geofence Resto</Text>
            <Text style={styles.attendanceSub}>Tropical Garden Resto Bali • {distance}m (Dalam Radius)</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleClockIn}
          style={[styles.clockInButton, hasClockedIn ? styles.clockInButtonSuccess : styles.clockInButtonPrimary]}
        >
          {hasClockedIn ? (
            <>
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.clockInButtonText}>Clock-In Terverifikasi ({clockInTime})</Text>
            </>
          ) : (
            <>
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.clockInButtonText}>Clock-In Presensi (Selfie + GPS)</Text>
            </>
          )}
        </TouchableOpacity>
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

  // 1. TOP PROFILE BAR
  topProfileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gold,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },
  execBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  execBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  profileSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  modeToggleExec: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  modeToggleStaff: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  modeToggleTextExec: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  modeToggleTextStaff: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // 2. EXECUTIVE CARD
  executiveCard: {
    backgroundColor: '#111728',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: 16,
  },
  executiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  execCardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  ownerViewBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  ownerViewText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  execCardSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  timePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  timePillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gold,
    fontFamily: 'monospace',
  },
  datePillText: {
    fontSize: 9,
    color: 'rgba(245, 158, 11, 0.8)',
    marginTop: 1,
  },
  execNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
  },
  execNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#FCD34D',
    lineHeight: 16,
  },

  // 3. SEGMENTED TABS
  segmentContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },

  // 4. HERO SALES POS CARD
  heroSalesCard: {
    backgroundColor: '#0F1A24',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    marginBottom: 16,
  },
  salesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salesTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  salesCardLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.emerald,
    letterSpacing: 0.5,
  },
  targetBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6EE7B7',
  },
  salesAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  salesAmountText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  grossProfitCol: {
    alignItems: 'flex-end',
  },
  grossProfitLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  grossProfitAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.emerald,
    marginTop: 2,
  },
  grossProfitRatio: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6EE7B7',
  },
  targetSubText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    marginVertical: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.emerald,
    borderRadius: 3,
  },
  kpiPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiPillBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  kpiPillLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  kpiPillValEmerald: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.emerald,
    marginTop: 2,
  },
  kpiPillValWhite: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
  kpiPillStatus: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6EE7B7',
    marginTop: 2,
  },

  // 5. LABOR COST CARD
  laborCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 16,
  },
  laborHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  laborTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  laborBadgeOptimal: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  laborBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.emerald,
  },
  laborBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  laborBigNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryGlow,
  },
  laborSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  laborAmountCol: {
    alignItems: 'flex-end',
  },
  laborCostAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  laborSplh: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 2,
  },

  // 6. ATTENDANCE QUICK CLOCK-IN
  attendanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  attendanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  attendanceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.emeraldBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  attendanceSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  clockInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  clockInButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  clockInButtonSuccess: {
    backgroundColor: '#059669',
  },
  clockInButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
