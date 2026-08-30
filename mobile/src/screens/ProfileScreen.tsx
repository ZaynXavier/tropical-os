import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { getApiBaseUrl, setApiBaseUrl } from '../api/client';
import {
  User,
  Shield,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  Server,
  LogOut,
  Crown,
  Sparkles,
  Award,
} from 'lucide-react-native';

export const ProfileScreen: React.FC = () => {
  const [apiHost, setApiHost] = useState('');

  useEffect(() => {
    getApiBaseUrl().then(setApiHost);
  }, []);

  const handleSaveApiHost = async () => {
    await setApiBaseUrl(apiHost);
    Alert.alert('Tersimpan ✨', `Backend Host diatur ke: ${apiHost}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>TH</Text>
        </View>
        <Text style={styles.nameText}>Tri Hermawanto</Text>
        
        <View style={styles.roleBadgeRow}>
          <View style={styles.execBadge}>
            <Crown size={12} color={COLORS.gold} />
            <Text style={styles.execBadgeText}>OWNER • EXECUTIVE</Text>
          </View>
          <View style={styles.codeBadge}>
            <Text style={styles.codeBadgeText}>EMP-01</Text>
          </View>
        </View>

        <Text style={styles.deptText}>Owner &amp; Executive Director • Tropical Garden Resto Bali</Text>
      </View>

      {/* Detail Personal Info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Informasi Personil &amp; Garis Komando</Text>

        <View style={styles.infoRow}>
          <Mail size={16} color={COLORS.primaryGlow} />
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Email Resmi</Text>
            <Text style={styles.infoVal}>tri@tropical.resto</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Phone size={16} color={COLORS.primaryGlow} />
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Nomor WhatsApp</Text>
            <Text style={styles.infoVal}>+62 812-1111-2222</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={16} color={COLORS.primaryGlow} />
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Masa Kerja &amp; Status</Text>
            <Text style={styles.infoVal}>Sejak 1 Januari 2024 (Pendiri)</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Shield size={16} color={COLORS.gold} />
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Hak Akses Sistem</Text>
            <Text style={[styles.infoVal, { color: COLORS.gold, fontWeight: 'bold' }]}>
              OWNER (Full Unlimited Privileges)
            </Text>
          </View>
        </View>
      </View>

      {/* Backend API Host Configuration (For Local Testing on Phone) */}
      <View style={styles.sectionCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Server size={18} color={COLORS.primaryGlow} />
          <Text style={styles.sectionTitle}>Koneksi Backend Server (LAN / WiFi)</Text>
        </View>
        <Text style={styles.configDesc}>
          Gunakan alamat IP laptop Anda saat pengujian di HP fisik melalui jaringan Wi-Fi lokal.
        </Text>

        <TextInput
          value={apiHost}
          onChangeText={setApiHost}
          placeholder="http://localhost:8000/api/v1"
          placeholderTextColor="#6B7280"
          style={styles.hostInput}
        />

        <TouchableOpacity onPress={handleSaveApiHost} style={styles.saveHostBtn}>
          <Text style={styles.saveHostBtnText}>Simpan Pengaturan Host</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={() => Alert.alert('Keluar Akun', 'Apakah Anda yakin ingin logout dari aplikasi TropicalOS?')}
        style={styles.logoutBtn}
      >
        <LogOut size={18} color={COLORS.rose} />
        <Text style={styles.logoutBtnText}>Keluar dari Akun</Text>
      </TouchableOpacity>
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
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    marginBottom: 16,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  execBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  execBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  codeBadge: {
    backgroundColor: COLORS.emeraldBg,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  codeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.emerald,
  },
  deptText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 1,
  },
  configDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 10,
  },
  hostInput: {
    backgroundColor: COLORS.cardSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    color: COLORS.text,
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  saveHostBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveHostBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.roseBg,
    borderWidth: 1,
    borderColor: COLORS.roseBorder,
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.rose,
  },
});
