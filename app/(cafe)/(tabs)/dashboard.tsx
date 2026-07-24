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
import { cafeProfileService, type CafeProfile, type CafeDashboardStats } from '../../../services/cafeProfileService';
import { spaceBookingService } from '../../../services/spaceBookingService';
import { calendarService } from '../../../services/calendarService';
import type { CalendarEvent } from '../../../services/calendarService';
import { CalendarWidget } from '../../../components/CalendarWidget';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';
import { useUnreadCount } from '../../../hooks/useUnreadCount';
import { useFloatingTabBarClearance } from '../../../components/layout/FloatingTabBar';

export default function CafeDashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const tabBarClearance = useFloatingTabBarClearance();
  const { unreadCount } = useUnreadCount(30000);
  const [dashboard, setDashboard] = useState<CafeDashboardStats | null>(null);
  const [profile, setProfile] = useState<CafeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookingCounts, setBookingCounts] = useState({ pendingBookings: 0, totalBookings: 0 });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [dashboardResult, profileResult, bookingsResult] = await Promise.allSettled([
        cafeProfileService.getDashboard(),
        cafeProfileService.getMe(),
        spaceBookingService.getIncoming(),
      ]);
      if (dashboardResult.status === 'fulfilled') setDashboard(dashboardResult.value);
      if (profileResult.status === 'fulfilled') setProfile(profileResult.value);
      if (bookingsResult.status === 'fulfilled') {
        const bookings = bookingsResult.value;
        setBookingCounts({
          pendingBookings: bookings.filter((b) => b.status === 'Pending').length,
          totalBookings: bookings.length,
        });
      }
    } catch (error) {
      if (__DEV__) console.log('Dashboard yüklenemedi', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); loadCalendarEvents(); }, [loadData]);

  async function loadCalendarEvents() {
    try {
      setCalendarEvents(await calendarService.getCafeCalendarEvents());
    } catch (error) {
      if (__DEV__) console.log('Takvim etkinlikleri yüklenemedi', error);
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
      contentContainerStyle={[styles.container, { paddingBottom: tabBarClearance }]}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {user?.firstName}</Text>
          <Text style={styles.subGreeting}>{profile?.name || 'Profilini tamamla'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => router.push('/(cafe)/(tabs)/notifications')}
            accessibilityRole="button"
            accessibilityLabel="Bildirimler"
          >
            <Icon name="notifications" size={18} color={Colors.onSurfaceVariant} />
            {unreadCount > 0 && <View style={styles.headerActionBadge} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} accessibilityRole="button" accessibilityLabel="Çıkış yap">
            <Icon name="logout" size={19} color={Pastel.coral.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tier 1 — hero: kafe kimliği, cafe kategori rengi (coral) doygun */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Icon name="localCafe" size={26} color={Pastel.coral.heroText} />
        </View>
        <View style={styles.heroInfo}>
          <Text style={styles.heroLabel}>Kafe</Text>
          <Text style={styles.heroValue}>{profile?.name || 'Profilini tamamla'}</Text>
        </View>
        {profile?.avgRating != null && profile.avgRating > 0 && (
          <View style={styles.heroRating}>
            <Icon name="star" size={16} color={Pastel.coral.heroText} />
            <Text style={styles.heroRatingText}>{profile.avgRating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="eventAvailable" label="Aktif İlan" value={dashboard?.activeListings ?? 0} color={Pastel.coral.text} onPress={() => router.push('/(cafe)/(tabs)/listings' as any)} />
        <StatCard icon="libraryBooks" label="Toplam İlan" value={dashboard?.totalListings ?? 0} color={Pastel.coral.text} onPress={() => router.push('/(cafe)/(tabs)/listings' as any)} />
        <StatCard icon="howToReg" label="Bekleyen Rezervasyon" value={bookingCounts.pendingBookings} color={Pastel.amber.text} onPress={() => router.push('/(cafe)/(tabs)/bookings' as any)} />
        <StatCard icon="groups" label="Toplam Rezervasyon" value={bookingCounts.totalBookings} color={Pastel.purple.text} onPress={() => router.push('/(cafe)/(tabs)/bookings' as any)} />
      </View>

      <CalendarWidget events={calendarEvents} loading={calendarLoading} />

      <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
      <View style={styles.actionsRow}>
        <Button variant="tile" icon="addCircleOutline" label="İlan Oluştur" onPress={() => router.push('/(cafe)/listing/create' as any)} />
        <Button variant="tile" icon="edit" label="Profili Düzenle" onPress={() => router.push('/(cafe)/(tabs)/profile' as any)} />
      </View>
      <View style={styles.actionsRow}>
        <Button variant="tile" icon="listAlt" label="İlanlarım" onPress={() => router.push('/(cafe)/(tabs)/listings' as any)} />
        <Button variant="tile" icon="eventAvailable" label="Rezervasyonlar" onPress={() => router.push('/(cafe)/(tabs)/bookings' as any)} />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  container: { paddingHorizontal: Spacing.containerMargin, paddingTop: Spacing.xl, gap: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  greeting: { ...Typography.serifHeading, fontSize: 22, lineHeight: 28, color: Colors.onSurface },
  subGreeting: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  headerActionBtn: { width: 34, height: 34, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  headerActionBadge: { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
  logoutButton: { padding: Spacing.sm, borderRadius: Radius.full, backgroundColor: Pastel.coral.tint },
  heroCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Pastel.coral.hero, borderRadius: Radius.xxxl, padding: Spacing.md, gap: Spacing.sm },
  heroBadge: { width: 48, height: 48, borderRadius: Radius.full, backgroundColor: Colors.glassOverlay.soft, justifyContent: 'center', alignItems: 'center' },
  heroInfo: { flex: 1 },
  heroLabel: { ...Typography.labelSm, color: Pastel.coral.heroText, opacity: 0.85 },
  heroValue: { ...Typography.serifTitleLg, color: Pastel.coral.heroText, marginTop: 2 },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroRatingText: { ...Typography.h2, color: Pastel.coral.heroText },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  sectionTitle: { ...Typography.serifTitle, color: Colors.onSurface, marginTop: Spacing.sm },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
});
