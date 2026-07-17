import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Icon } from '../../../components/ui/Icon';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { spaceBookingService, type SpaceBooking, type SpaceBookingStatus } from '../../../services/spaceBookingService';

const STATUS_LABELS: Record<SpaceBookingStatus, { label: string; color: string; bg: string }> = {
  Pending: { label: 'Bekliyor', color: Colors.secondary, bg: Colors.secondaryContainer },
  Approved: { label: 'Onaylandı', color: Colors.primary, bg: Colors.primaryContainer },
  Rejected: { label: 'Reddedildi', color: Colors.error, bg: Colors.errorContainer },
  Cancelled: { label: 'İptal', color: Colors.outline, bg: Colors.surfaceContainer },
  Completed: { label: 'Tamamlandı', color: '#0F766E', bg: '#CCFBF1' },
};

export default function CafeBookingsScreen() {
  const [bookings, setBookings] = useState<SpaceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      const data = await spaceBookingService.getIncoming();
      setBookings(data);
    } catch (error) {
      console.log('Rezervasyon talepleri yüklenemedi', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadBookings(); }, [loadBookings]));

  function confirmApprove(item: SpaceBooking) {
    Alert.alert('Onayla', `"${item.spaceListingTitle ?? 'Bu alan'}" için rezervasyon talebini onaylamak istediğine emin misin?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Onayla',
        onPress: async () => {
          setActionId(item.id);
          try {
            await spaceBookingService.approve(item.id);
            setBookings((prev) => prev.map((b) => b.id === item.id ? { ...b, status: 'Approved' } : b));
          } catch (error: any) {
            const message = error?.response?.data?.message || 'Onaylama işlemi başarısız.';
            Alert.alert('Hata', message);
          } finally {
            setActionId(null);
          }
        },
      },
    ]);
  }

  function confirmReject(item: SpaceBooking) {
    Alert.alert('Reddet', `"${item.spaceListingTitle ?? 'Bu alan'}" için rezervasyon talebini reddetmek istediğine emin misin?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Reddet',
        style: 'destructive',
        onPress: async () => {
          setActionId(item.id);
          try {
            await spaceBookingService.reject(item.id);
            setBookings((prev) => prev.map((b) => b.id === item.id ? { ...b, status: 'Rejected' } : b));
          } catch (error: any) {
            const message = error?.response?.data?.message || 'Reddetme işlemi başarısız.';
            Alert.alert('Hata', message);
          } finally {
            setActionId(null);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']} header={<Text style={styles.title}>Rezervasyonlar</Text>}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBookings(); }} colors={[Colors.primary]} />}
        contentContainerStyle={styles.content}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="eventBusy" size={40} color={Colors.outline} />
            <Text style={styles.emptyTitle}>Henüz talep yok</Text>
            <Text style={styles.emptyText}>İlanlarına gelen rezervasyon talepleri burada görünecek.</Text>
          </View>
        ) : bookings.map((item) => {
          const statusStyle = STATUS_LABELS[item.status] ?? STATUS_LABELS.Pending;
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.spaceListingTitle ?? 'Alan'}</Text>
                  <Text style={styles.cardSubtitle}>{item.employerWorkshopTitle ?? item.employerFullName ?? 'Employer'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.badgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Icon name="event" size={14} color={Colors.outline} />
                <Text style={styles.metaText}>
                  {new Date(item.startDateTime).toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                  {' – '}
                  {new Date(item.endDateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="payments" size={14} color={Colors.outline} />
                <Text style={styles.metaText}>{item.totalPrice} ₺</Text>
              </View>

              {item.status === 'Pending' ? (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    disabled={actionId === item.id}
                    onPress={() => confirmApprove(item)}
                  >
                    <Text style={styles.actionText}>Onayla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    disabled={actionId === item.id}
                    onPress={() => confirmReject(item)}
                  >
                    <Text style={styles.actionText}>Reddet</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h3, color: Colors.onSurface },
  content: { padding: Spacing.md, gap: Spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.xs },
  emptyTitle: { ...Typography.h3, color: Colors.onSurface },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
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
  approveButton: {
    backgroundColor: Colors.primary,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  actionText: { ...Typography.labelMd, color: '#FFFFFF' },
});
