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
  Image,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postService } from '../../../services/postService';
import { employeeService } from '../../../services/employeeService';
import type { EmployeeProfile } from '../../../services/employeeService';
import type { UserSocialStats } from '../../../types/post.types';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';
import { Colors } from '../../../constants/theme';
import { formatCityDistrict } from '../../../utils/locationFormat';

const ACCENT = Colors.primary;
const COVER_HEIGHT = 168; // spec: kapak alanı varsayılan 210px'den biraz kısaltıldı

export default function EmployeeProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [stats, setStats] = useState<UserSocialStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const p = await employeeService.getProfile();
      setProfile(p);
    } catch {
      // sessiz hata — kapak/temel bilgiler için ikincil veri kaynağı
    }
  }, []);

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

  const handleShare = useCallback(() => {
    const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    Share.share({ message: `${name || 'Bu profili'} Atolium'da keşfet!` });
  }, [user?.firstName, user?.lastName]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshUser(), fetchStats(), fetchProfile()]);
    setRefreshing(false);
  }, [fetchStats, fetchProfile, refreshUser]);

  useEffect(() => { fetchStats(); fetchProfile(); }, []);

  // Profili düzenle ekranından dönüldüğünde (kapak/avatar/bio/interests
  // güncellenmiş olabilir) güncel veriyi tazele.
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Profil üst */}
      <ProfileHeader
        coverUrl={profile?.coverImageUrl}
        coverHeight={COVER_HEIGHT}
        avatarUrl={user?.avatarUrl}
        fullName={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
        roleLabel="Katılımcı"
        bio={user?.bio}
        city={formatCityDistrict(user?.city, user?.district)}
        stats={[
          { label: 'Gönderi', value: stats?.postCount ?? 0 },
          { label: 'Takipçi', value: stats?.followerCount ?? 0 },
          { label: 'Takip', value: stats?.followingCount ?? 0 },
        ]}
        actions={{
          variant: 'own',
          onEditProfile: () => router.push('/(employee)/edit-profile' as any),
          onShareProfile: handleShare,
        }}
      />

      <View style={styles.logoutRow}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert('Çıkış', 'Çıkış yapmak istiyor musun?', [
              { text: 'İptal', style: 'cancel' },
              { text: 'Çıkış', style: 'destructive', onPress: handleLogout },
            ])
          }
        >
          <Ionicons name="log-out-outline" size={16} color="#6B7280" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

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
          {formatCityDistrict(user?.city, user?.district) ? (
            <>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{formatCityDistrict(user?.city, user?.district)}</Text>
              </View>
            </>
          ) : null}
          {user?.employeeProfile ? (
            <>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                <Text style={styles.infoText}>{user.employeeProfile.totalAttendedWorkshops} tamamlanan atölye</Text>
              </View>
            </>
          ) : null}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },

  // ─── Çıkış ─────────────────────────────────────────────────────────────────
  logoutRow: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  logoutText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },

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