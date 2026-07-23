import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../../components/ui/Icon';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { employerService } from '../../../services/employerService';
import { enrollmentService } from '../../../services/enrollmentService';
import { workshopService } from '../../../services/workshopService';
import { EmployerDashboard } from '../../../types/dashboard';
import { EmployerProfile } from '../../../services/employerService';
import { calendarService } from '../../../services/calendarService';
import type { CalendarEvent } from '../../../services/calendarService';
import { CalendarWidget } from '../../../components/CalendarWidget';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';
import { useUnreadCount } from '../../../hooks/useUnreadCount';
import { FLOATING_TAB_BAR_CLEARANCE } from '../../../components/layout/FloatingTabBar';

export default function EmployerDashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { unreadCount } = useUnreadCount(30000);
  const [dashboard, setDashboard] = useState<EmployerDashboard | null>(null);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fallbackCounts, setFallbackCounts] = useState({ pendingEnrollments: 0, totalEnrollments: 0, activeWorkshops: 0, totalWorkshops: 0 });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [dashboardResult, profileResult] = await Promise.allSettled([
        employerService.getDashboard(),
        employerService.getProfile(),
      ]);

      if (dashboardResult.status === 'fulfilled') setDashboard(dashboardResult.value);
      if (profileResult.status === 'fulfilled') setProfile(profileResult.value);

      const dashboardCountsMissing =
        !dashboardResult ||
        dashboardResult.status !== 'fulfilled' ||
        dashboardResult.value == null ||
        dashboardResult.value.activeWorkshops == null ||
        dashboardResult.value.totalWorkshops == null ||
        dashboardResult.value.pendingEnrollments == null ||
        dashboardResult.value.totalEnrollments == null;

      if (dashboardCountsMissing) {
        try {
          const [enrollments, workshops] = await Promise.all([
            enrollmentService.getEmployerEnrollments(),
            workshopService.getMyWorkshops(),
          ]);
          setFallbackCounts({
            pendingEnrollments: enrollments.filter((e) => e.status === 'pending').length,
            totalEnrollments: enrollments.length,
            activeWorkshops: workshops.filter((w) => w.status === 'published').length,
            totalWorkshops: workshops.length,
          });
        } catch (fallbackError) {
          console.log('Dashboard yedeği yüklenemedi', fallbackError);
        }
      }
    } catch (error) {
      console.log('Dashboard yüklenemedi', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadCalendarEvents();
  }, [loadData]);

  async function loadCalendarEvents() {
    try {
      setCalendarEvents(await calendarService.getEmployerCalendarEvents());
    } catch (error) {
      console.log('Takvim etkinlikleri yüklenemedi', error);
    } finally {
      setCalendarLoading(false);
    }
  }

  function onRefresh() {
    setIsRefreshing(true);
    loadData();
  }

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {user?.firstName}</Text>
          <Text style={styles.subGreeting}>{profile?.workshopTitle || 'Profilini tamamla'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn} onPress={() => router.push('/(employer)/(tabs)/search')}>
            <Icon name="search" size={18} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} onPress={() => router.push('/(employer)/(tabs)/notifications')}>
            <Icon name="notifications" size={18} color={Colors.onSurfaceVariant} />
            {unreadCount > 0 && <View style={styles.headerActionBadge} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" size={19} color={Pastel.coral.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tier 1 — hero: rozet/başarı tek öncelikli içerik, solid doygun mor pastel */}
      <View style={styles.rankCard}>
        <View style={styles.rankBadge}>
          <Icon name="workspacePremium" size={26} color={Pastel.purple.heroText} />
        </View>
        <View style={styles.rankInfo}>
          <Text style={styles.rankLabel}>Atölyeci Seviyesi</Text>
          <Text style={styles.rankValue}>{dashboard?.employerRank}</Text>
        </View>
        <View style={styles.xpContainer}>
          <Text style={styles.xpValue}>{dashboard?.xpPoints}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>

      {/* Tier 2 — istatistik grid, kategori renkleriyle kodlanmış */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="eventAvailable"
          label="Aktif Atölye"
          value={dashboard?.activeWorkshops ?? fallbackCounts.activeWorkshops ?? 0}
          color={Pastel.teal.text}
          onPress={() => router.push('/(employer)/workshop?status=published' as any)}
        />
        <StatCard
          icon="libraryBooks"
          label="Toplam Atölye"
          value={dashboard?.totalWorkshops ?? fallbackCounts.totalWorkshops ?? 0}
          color={Pastel.teal.text}
          onPress={() => router.push('/(employer)/workshop' as any)}
        />
        <StatCard
          icon="howToReg"
          label="Bekleyen Kayıt"
          value={dashboard?.pendingEnrollments ?? fallbackCounts.pendingEnrollments ?? 0}
          color={Pastel.amber.text}
          onPress={() => router.push('/(employer)/enrollments?status=pending' as any)}
        />
        <StatCard
          icon="groups"
          label="Toplam Kayıt"
          value={dashboard?.totalEnrollments ?? fallbackCounts.totalEnrollments ?? 0}
          color={Pastel.purple.text}
          onPress={() => router.push('/(employer)/enrollments' as any)}
        />
      </View>

      <View style={styles.ratingCard}>
        <View>
          <Text style={styles.ratingTitle}>Ortalama Puanın</Text>
          <Text style={styles.ratingSubtitle}>{dashboard?.reviewCount ?? 0} değerlendirme</Text>
        </View>
        <View style={styles.ratingRight}>
          <Icon name="star" size={20} color={Colors.amber} />
          <Text style={styles.ratingValue}>{dashboard?.avgRating ? dashboard.avgRating.toFixed(1) : '—'}</Text>
        </View>
      </View>

      <CalendarWidget events={calendarEvents} loading={calendarLoading} />

      <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
      <View style={styles.actionsRow}>
        <Button variant="tile" icon="addCircleOutline" label="Atölye Oluştur" onPress={() => router.push('/(employer)/workshop/create')} />
        <Button variant="tile" icon="edit" label="Profili Düzenle" onPress={() => router.push('/(employer)/profile')} />
      </View>
      <View style={styles.actionsRow}>
        <Button variant="tile" icon="search" label="Mekan Bul" onPress={() => router.push('/(employer)/(tabs)/search')} />
        <Button variant="tile" icon="listAlt" label="Atölyelerim" onPress={() => router.push('/(employer)/workshop')} />
      </View>
      <View style={styles.actionsRow}>
        <Button variant="tile" icon="eventAvailable" label="Rezervasyonlarım" onPress={() => router.push('/(employer)/bookings')} />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  container: { paddingHorizontal: Spacing.containerMargin, paddingTop: Spacing.xl, paddingBottom: Spacing.xl + FLOATING_TAB_BAR_CLEARANCE, gap: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  greeting: { ...Typography.serifHeading, fontSize: 22, lineHeight: 28, color: Colors.onSurface },
  subGreeting: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  headerActionBtn: { width: 34, height: 34, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  headerActionBadge: { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
  logoutButton: { padding: Spacing.sm, borderRadius: Radius.full, backgroundColor: Pastel.coral.tint },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Pastel.purple.hero,
    borderRadius: Radius.xxxl,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rankBadge: { width: 48, height: 48, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' },
  rankInfo: { flex: 1 },
  rankLabel: { ...Typography.labelSm, color: Pastel.purple.heroText, opacity: 0.85 },
  rankValue: { ...Typography.serifTitleLg, color: Pastel.purple.heroText, marginTop: 2 },
  xpContainer: { alignItems: 'flex-end' },
  xpValue: { ...Typography.h2, fontFamily: undefined, color: Pastel.purple.heroText },
  xpLabel: { ...Typography.labelSm, color: Pastel.purple.heroText, opacity: 0.85 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  ratingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Pastel.amber.tint,
    borderRadius: Radius.xxl,
    padding: Spacing.md,
  },
  ratingTitle: { ...Typography.labelMd, color: Colors.onSurface },
  ratingSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  ratingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingValue: { ...Typography.h2, color: Pastel.amber.text },
  sectionTitle: { ...Typography.serifTitle, color: Colors.onSurface, marginTop: Spacing.sm },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
});
