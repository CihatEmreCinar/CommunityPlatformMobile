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
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { employerService } from '../../../services/employerService';import { enrollmentService } from '../../../services/enrollmentService';
import { workshopService } from '../../../services/workshopService';import { EmployerDashboard } from '../../../types/dashboard';
import { EmployerProfile } from '../../../services/employerService';
import { calendarService } from '../../../services/calendarService';
import type { CalendarEvent } from '../../../services/calendarService';
import { CalendarWidget } from '../../../components/CalendarWidget';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';

export default function EmployerDashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
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

      if (dashboardResult.status === 'fulfilled') {
        setDashboard(dashboardResult.value);
      }

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value);
      }

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

          const pendingEnrollments = enrollments.filter((item) => item.status === 'pending').length;
          const totalEnrollments = enrollments.length;
          const activeWorkshops = workshops.filter((item) => item.status === 'published').length;
          const totalWorkshops = workshops.length;

          setFallbackCounts({ pendingEnrollments, totalEnrollments, activeWorkshops, totalWorkshops });
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
      const events = await calendarService.getEmployerCalendarEvents();
      setCalendarEvents(events);
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
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {user?.firstName}</Text>
          <Text style={styles.subGreeting}>
            {profile?.workshopTitle || 'Profilini tamamla'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Rank Card */}
      <View style={styles.rankCard}>
        <View style={styles.rankBadge}>
          <MaterialIcons name="workspace-premium" size={28} color={Colors.onPrimary} />
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

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="event-available"
          label="Aktif Atölye"
          value={dashboard?.activeWorkshops ?? fallbackCounts.activeWorkshops ?? 0}
          color={Colors.primary}
          onPress={() => router.push('/(employer)/workshop?status=published' as any)}
        />
        <StatCard
          icon="library-books"
          label="Toplam Atölye"
          value={dashboard?.totalWorkshops ?? fallbackCounts.totalWorkshops ?? 0}
          color={Colors.secondary}
          onPress={() => router.push('/(employer)/workshop' as any)}
        />
        <StatCard
          icon="how-to-reg"
          label="Bekleyen Kayıt"
          value={dashboard?.pendingEnrollments ?? fallbackCounts.pendingEnrollments ?? 0}
          color={Colors.amber}
          onPress={() => router.push('/(employer)/enrollments?status=pending' as any)}
        />
        <StatCard
          icon="groups"
          label="Toplam Kayıt"
          value={dashboard?.totalEnrollments ?? fallbackCounts.totalEnrollments ?? 0}
          color={Colors.primaryMid}
          onPress={() => router.push('/(employer)/enrollments' as any)}
        />
      </View>

      {/* Rating Card */}
      <View style={styles.ratingCard}>
        <View style={styles.ratingLeft}>
          <Text style={styles.ratingTitle}>Ortalama Puanın</Text>
          <Text style={styles.ratingSubtitle}>
            {dashboard?.reviewCount ?? 0} değerlendirme
          </Text>
        </View>
        <View style={styles.ratingRight}>
          <MaterialIcons name="star" size={22} color={Colors.amber} />
          <Text style={styles.ratingValue}>
            {dashboard?.avgRating ? dashboard.avgRating.toFixed(1) : '—'}
          </Text>
        </View>
      </View>

   {/* Takvim */}
      <CalendarWidget events={calendarEvents} loading={calendarLoading} />

   {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
      <View style={styles.actionsRow}>
        <ActionButton
          icon="add-circle-outline"
          label="Atölye Oluştur"
          onPress={() => router.push('/(employer)/workshop/create')}
        />
        <ActionButton
          icon="edit"
          label="Profili Düzenle"
          onPress={() => router.push('/(employer)/profile')}
        />
      </View>
      <View style={styles.actionsRow}>
        <ActionButton
          icon="search"
          label="Mekan Bul"
          onPress={() => router.push('/(employer)/(tabs)/search')}
        />
        <ActionButton
          icon="list-alt"
          label="Atölyelerim"
          onPress={() => router.push('/(employer)/workshop')}
        />
      </View>
      <View style={styles.actionsRow}>
        <ActionButton
          icon="event-available"
          label="Rezervasyonlarım"
          onPress={() => router.push('/(employer)/bookings')}
        />
      </View>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: number;
  color: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '1A' }]}> 
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.statCardTouchable}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionButton} activeOpacity={0.85} onPress={onPress}>
      <MaterialIcons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  greeting: {
    ...Typography.h1Mobile,
    color: Colors.onSurface,
  },
  subGreeting: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  logoutButton: {
    padding: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    ...Shadows.sm,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankInfo: { flex: 1 },
  rankLabel: {
    ...Typography.labelSm,
    color: 'rgba(255,255,255,0.8)',
  },
  rankValue: {
    ...Typography.h2,
    color: Colors.onPrimary,
    marginTop: 2,
  },
  xpContainer: { alignItems: 'flex-end' },
  xpValue: {
    ...Typography.h2,
    color: Colors.onPrimary,
  },
  xpLabel: {
    ...Typography.labelSm,
    color: 'rgba(255,255,255,0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h1Mobile,
    color: Colors.onSurface,
  },
  statLabel: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  ratingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  ratingLeft: {},
  ratingTitle: {
    ...Typography.labelMd,
    color: Colors.onSurface,
  },
  ratingSubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  ratingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    ...Typography.h2,
    color: Colors.onSurface,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.onSurface,
    marginTop: Spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCardTouchable: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    paddingVertical: Spacing.sm,
    ...Shadows.sm,
  },
  actionLabel: {
    ...Typography.labelMd,
    color: Colors.primary,
  },
});