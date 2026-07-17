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
import { Icon } from '../../../components/ui/Icon';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { cafeProfileService, type CafeProfile, type CafeDashboardStats } from '../../../services/cafeProfileService';
import { spaceBookingService } from '../../../services/spaceBookingService';
import { calendarService } from '../../../services/calendarService';
import type { CalendarEvent } from '../../../services/calendarService';
import { CalendarWidget } from '../../../components/CalendarWidget';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';

export default function CafeDashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
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

      if (dashboardResult.status === 'fulfilled') {
        setDashboard(dashboardResult.value);
      }

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value);
      }

      if (bookingsResult.status === 'fulfilled') {
        const bookings = bookingsResult.value;
        setBookingCounts({
          pendingBookings: bookings.filter((b) => b.status === 'Pending').length,
          totalBookings: bookings.length,
        });
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
      const events = await calendarService.getCafeCalendarEvents();
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
            {profile?.name || 'Profilini tamamla'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="eventAvailable"
          label="Aktif İlan"
          value={dashboard?.activeListings ?? 0}
          color={Colors.primary}
          onPress={() => router.push('/(cafe)/(tabs)/listings' as any)}
        />
        <StatCard
          icon="libraryBooks"
          label="Toplam İlan"
          value={dashboard?.totalListings ?? 0}
          color={Colors.secondary}
          onPress={() => router.push('/(cafe)/(tabs)/listings' as any)}
        />
        <StatCard
          icon="howToReg"
          label="Bekleyen Rezervasyon"
          value={bookingCounts.pendingBookings}
          color={Colors.amber}
          onPress={() => router.push('/(cafe)/(tabs)/bookings' as any)}
        />
        <StatCard
          icon="groups"
          label="Toplam Rezervasyon"
          value={bookingCounts.totalBookings}
          color={Colors.primaryMid}
          onPress={() => router.push('/(cafe)/(tabs)/bookings' as any)}
        />
      </View>

      {/* Takvim */}
      <CalendarWidget events={calendarEvents} loading={calendarLoading} />

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
      <View style={styles.actionsRow}>
        <Button
          variant="tile"
          icon="addCircleOutline"
          label="İlan Oluştur"
          onPress={() => router.push('/(cafe)/listing/create' as any)}
        />
        <Button
          variant="tile"
          icon="edit"
          label="Profili Düzenle"
          onPress={() => router.push('/(cafe)/(tabs)/profile' as any)}
        />
      </View>
      <View style={styles.actionsRow}>
        <Button
          variant="tile"
          icon="listAlt"
          label="İlanlarım"
          onPress={() => router.push('/(cafe)/(tabs)/listings' as any)}
        />
        <Button
          variant="tile"
          icon="eventAvailable"
          label="Rezervasyonlar"
          onPress={() => router.push('/(cafe)/(tabs)/bookings' as any)}
        />
      </View>
    </ScrollView>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
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
});