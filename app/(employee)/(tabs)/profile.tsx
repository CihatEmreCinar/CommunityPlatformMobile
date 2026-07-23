import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Share,
} from 'react-native';
import { Icon } from '../../../components/ui/Icon';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postService } from '../../../services/postService';
import { employeeService } from '../../../services/employeeService';
import type { EmployeeProfile } from '../../../services/employeeService';
import type { UserSocialStats } from '../../../types/post.types';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';
import { FLOATING_TAB_BAR_CLEARANCE } from '../../../components/layout/FloatingTabBar';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';
import { formatCityDistrict } from '../../../utils/locationFormat';

const ACCENT = Colors.primary;
const COVER_HEIGHT = 168;

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

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
      showsVerticalScrollIndicator={false}
    >
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
          <Icon name="logOutOutline" size={15} color={Pastel.coral.text} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      {/* İkincil kart — hesap özeti (teal tint, border yok) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="mailOutline" size={18} color={Colors.onSurfaceVariant} />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="starOutline" size={18} color={Pastel.amber.text} />
            <Text style={styles.infoText}>{user?.xpPoints ?? 0} XP</Text>
            <View style={styles.levelChip}>
              <Text style={styles.levelText}>Seviye {user?.rankLevel ?? 1}</Text>
            </View>
          </View>
          {formatCityDistrict(user?.city, user?.district) ? (
            <View style={styles.infoRow}>
              <Icon name="locationOutline" size={18} color={Colors.onSurfaceVariant} />
              <Text style={styles.infoText}>{formatCityDistrict(user?.city, user?.district)}</Text>
            </View>
          ) : null}
          {user?.employeeProfile ? (
            <View style={styles.infoRow}>
              <Icon name="checkmarkCircleOutline" size={18} color={Pastel.teal.text} />
              <Text style={styles.infoText}>{user.employeeProfile.totalAttendedWorkshops} tamamlanan atölye</Text>
            </View>
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
            <Icon name="calendarOutline" size={20} color={ACCENT} />
            <Text style={styles.quickText}>Kayıtlarım</Text>
            <Icon name="chevronForward" size={16} color={Colors.outline} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickRow}
            onPress={() => router.push('/(employee)/(tabs)/home' as any)}
            activeOpacity={0.7}
          >
            <Icon name="searchOutline" size={20} color={ACCENT} />
            <Text style={styles.quickText}>Atölyeleri Keşfet</Text>
            <Icon name="chevronForward" size={16} color={Colors.outline} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: FLOATING_TAB_BAR_CLEARANCE },
  safeArea: { flex: 1, backgroundColor: Colors.background },

  logoutRow: { backgroundColor: Colors.background, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Pastel.coral.tint,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoutText: { ...Typography.labelSm, fontWeight: '600', color: Pastel.coral.text },

  section: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.outline,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  infoCard: { backgroundColor: Pastel.teal.tint, borderRadius: Radius.xxl, overflow: 'hidden', gap: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4 },
  infoText: { flex: 1, ...Typography.bodyMd, color: Colors.onSurface },
  levelChip: { backgroundColor: Pastel.amber.tintStrong, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  levelText: { ...Typography.labelSm, fontWeight: '700', color: Pastel.amber.text },

  quickCard: { backgroundColor: Pastel.teal.tint, borderRadius: Radius.xxl, overflow: 'hidden', gap: 2 },
  quickRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4 },
  quickText: { flex: 1, ...Typography.bodyMd, fontWeight: '500', color: Colors.onSurface },
});
