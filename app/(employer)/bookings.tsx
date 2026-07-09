import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { spaceBookingService, type SpaceBooking, type SpaceBookingStatus } from '../../services/spaceBookingService';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_LABELS: Record<SpaceBookingStatus, { label: string; color: string; bg: string }> = {
  Pending: { label: 'Bekliyor', color: Colors.secondary, bg: Colors.secondaryContainer },
  Approved: { label: 'Onaylandı', color: Colors.primary, bg: Colors.primaryContainer },
  Rejected: { label: 'Reddedildi', color: Colors.error, bg: Colors.errorContainer },
  Cancelled: { label: 'İptal', color: Colors.outline, bg: Colors.surfaceContainer },
  Completed: { label: 'Tamamlandı', color: '#0F766E', bg: '#CCFBF1' },
};

export default function EmployerBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<SpaceBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      const data = await spaceBookingService.getMine();
      setBookings(data);
    } catch (error) {
      console.log('Rezervasyonlar yüklenemedi', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function handleCancel(id: string) {
    setActionId(id);
    try {
      await spaceBookingService.cancel(id);
      setBookings((prev) => prev.map((item) => item.id === id ? { ...item, status: 'Cancelled' } : item));
    } catch (error) {
      console.log('İptal edilemedi', error);
      Alert.alert('Hata', 'Rezervasyonu iptal ederken bir sorun oluştu.');
    } finally {
      setActionId(null);
    }
  }

  function onRefresh() {
    setIsRefreshing(true);
    loadBookings();
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Rezervasyonlarım</Text>
          <View style={{ width: 40 }} />
        </View>

        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={40} color={Colors.outline} />
            <Text style={styles.emptyTitle}>Rezervasyon yok</Text>
            <Text style={styles.emptyText}>Bir mekan bulup rezervasyon talebi oluşturabilirsin.</Text>
          </View>
        ) : (
          bookings.map((item) => {
            const statusStyle = STATUS_LABELS[item.status] ?? STATUS_LABELS.Pending;
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.spaceListingTitle ?? 'Alan'}</Text>
                    <Text style={styles.cardSubtitle}>{item.cafeName ?? 'Kafe'}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.badgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <MaterialIcons name="event" size={14} color={Colors.outline} />
                  <Text style={styles.metaText}>
                    {new Date(item.startDateTime).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                    {' – '}
                    {new Date(item.endDateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <MaterialIcons name="payments" size={14} color={Colors.outline} />
                  <Text style={styles.metaText}>{item.totalPrice} ₺</Text>
                </View>

                {item.status === 'Pending' ? (
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      disabled={actionId === item.id}
                      onPress={() => handleCancel(item.id)}
                    >
                      <Text style={styles.actionText}>İptal Et</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  container: { padding: Spacing.containerMargin, paddingBottom: Spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  title: { ...Typography.h3, color: Colors.onSurface },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl * 1.5, gap: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Colors.onSurface, marginTop: Spacing.sm },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
  cardTitleWrap: { flex: 1 },
  cardTitle: { ...Typography.h3, color: Colors.onSurface, fontSize: 16 },
  cardSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full, alignSelf: 'flex-start' },
  badgeText: { ...Typography.labelSm, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 13 },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.error,
  },
  actionText: { ...Typography.labelMd, color: '#FFFFFF' },
});
