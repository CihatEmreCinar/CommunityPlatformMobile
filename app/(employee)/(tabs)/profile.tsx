import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { postService } from '../../../services/postService';
import type { UserSocialStats } from '../../../types/post.types';

const ACCENT = '#6366F1';

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function EmployeeProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState<UserSocialStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const s = await postService.getSocialStats(user.id);
      setStats(s);
    } catch {
      // sessiz hata
    } finally {
      setLoadingStats(false);
    }
  }, [user?.id]);

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  useEffect(() => { fetchStats(); }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Profil üst */}
      <View style={styles.profileTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => router.push('/(employee)/edit-profile' as any)}
          >
            <Text style={styles.editProfileText}>Profili Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() =>
              Alert.alert('Çıkış', 'Çıkış yapmak istiyor musun?', [
                { text: 'İptal', style: 'cancel' },
                { text: 'Çıkış', style: 'destructive', onPress: handleLogout },
              ])
            }
          >
            <Ionicons name="log-out-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* İsim */}
      <View style={styles.nameSection}>
        <Text style={styles.fullName}>{user?.firstName} {user?.lastName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Katılımcı</Text>
        </View>
      </View>

      {/* Sosyal sayaçlar */}
      {loadingStats ? (
        <ActivityIndicator color={ACCENT} style={{ marginVertical: 16 }} />
      ) : (
        <View style={styles.statsRow}>
          <StatBox value={stats?.postCount ?? 0} label="Gönderi" />
          <View style={styles.statDivider} />
          <StatBox value={stats?.followerCount ?? 0} label="Takipçi" />
          <View style={styles.statDivider} />
          <StatBox value={stats?.followingCount ?? 0} label="Takip" />
        </View>
      )}

      {/* Bilgiler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Ionicons name="star-outline" size={18} color="#F59E0B" />
            <Text style={styles.infoText}>{user?.xpPoints ?? 0} XP</Text>
            <View style={styles.levelChip}>
              <Text style={styles.levelText}>Seviye {user?.rankLevel ?? 1}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Hızlı erişim */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        <View style={styles.quickCard}>
          <TouchableOpacity
            style={styles.quickRow}
            onPress={() => router.push('/(employee)/(tabs)/enrollments' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color={ACCENT} />
            <Text style={styles.quickText}>Kayıtlarım</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.quickRow}
            onPress={() => router.push('/(employee)/(tabs)/home' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={20} color={ACCENT} />
            <Text style={styles.quickText}>Atölyeleri Keşfet</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // ─── Profil üst ────────────────────────────────────────────────────────────
  profileTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 20, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  logoutBtn: { padding: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, marginTop: 4 },
  topActions: { flexDirection: 'column', gap: 8, alignItems: 'flex-end' },
  editProfileBtn: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#FFFFFF' },
  editProfileText: { fontSize: 13, fontWeight: '600', color: ACCENT },

  // ─── İsim ──────────────────────────────────────────────────────────────────
  nameSection: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 14, backgroundColor: '#FFFFFF' },
  fullName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  roleBadge: { backgroundColor: '#EEF2FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  roleText: { fontSize: 11, fontWeight: '600', color: ACCENT },

  // ─── Stats ─────────────────────────────────────────────────────────────────
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB' },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statDivider: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: '#E5E7EB' },

  // ─── Section ───────────────────────────────────────────────────────────────
  section: { padding: 16, gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },

  // ─── Info card ─────────────────────────────────────────────────────────────
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  infoText: { flex: 1, fontSize: 14, color: '#374151' },
  levelChip: { backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  levelText: { fontSize: 11, fontWeight: '600', color: '#D97706' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#F3F4F6', marginHorizontal: 14 },

  // ─── Quick access ──────────────────────────────────────────────────────────
  quickCard: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' },
  quickRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  quickText: { flex: 1, fontSize: 14, color: '#374151', fontWeight: '500' },
});