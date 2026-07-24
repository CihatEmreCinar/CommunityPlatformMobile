import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Icon } from '../../../components/ui/Icon';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';
import { spaceBookingService, type SpaceBooking } from '../../../services/spaceBookingService';
import { getSpaceBookingStatusStyle } from '../../../utils/spaceBookingStatus';
import { useFloatingTabBarClearance } from '../../../components/layout/FloatingTabBar';

export default function CafeBookingsScreen() {
  const tabBarClearance = useFloatingTabBarClearance();
  const [bookings, setBookings] = useState<SpaceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setBookings(await spaceBookingService.getIncoming());
    } catch (error) {
      if (__DEV__) console.log('Rezervasyon talepleri yüklenemedi', error);
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
            setBookings((prev) => prev.map((b) => (b.id === item.id ? { ...b, status: 'Approved' } : b)));
          } catch (error: any) {
            Alert.alert('Hata', error?.response?.data?.message || 'Onaylama işlemi başarısız.');
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
            setBookings((prev) => prev.map((b) => (b.id === item.id ? { ...b, status: 'Rejected' } : b)));
          } catch (error: any) {
            Alert.alert('Hata', error?.response?.data?.message || 'Reddetme işlemi başarısız.');
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
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']} scroll={false} header={<Text style={styles.title}>Rezervasyonlar</Text>}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBookings(); }} colors={[Colors.primary]} />}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
      >
        {bookings.length === 0 ? (
          <EmptyState icon="eventBusy" title="Henüz talep yok" description="İlanlarına gelen rezervasyon talepleri burada görünecek." style={styles.emptyState} />
        ) : bookings.map((item) => {
          const statusStyle = getSpaceBookingStatusStyle(item.status);
          return (
            <View key={item.id} style={[styles.card, { backgroundColor: statusStyle.bg.replace('1A', '14') }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.spaceListingTitle ?? 'Alan'}</Text>
                  <Text style={styles.cardSubtitle}>{item.employerWorkshopTitle ?? item.employerFullName ?? 'Employer'}</Text>
                </View>
                <Badge label={statusStyle.label} color={statusStyle.color} backgroundColor={statusStyle.bg} />
              </View>

              <View style={styles.metaRow}>
                <Icon name="event" size={13} color={Colors.onSurfaceVariant} />
                <Text style={styles.metaText}>
                  {new Date(item.startDateTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {' – '}
                  {new Date(item.endDateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="payments" size={13} color={Colors.onSurfaceVariant} />
                <Text style={styles.metaText}>{item.totalPrice} ₺</Text>
              </View>

              {item.status === 'Pending' ? (
                <View style={styles.cardActions}>
                  <Button style={styles.flexOne} color="primary" label="Onayla" disabled={actionId === item.id} onPress={() => confirmApprove(item)} />
                  <Button style={styles.flexOne} color="danger" label="Reddet" disabled={actionId === item.id} onPress={() => confirmReject(item)} />
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
  title: { ...Typography.serifTitleLg, color: Colors.onSurface },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md },
  emptyState: { paddingVertical: Spacing.xl * 2, gap: Spacing.xs },
  card: { borderRadius: Radius.xxl, padding: Spacing.md, gap: Spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
  cardTitleWrap: { flex: 1 },
  cardTitle: { ...Typography.labelMd, fontSize: 16, color: Colors.onSurface },
  cardSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  flexOne: { flex: 1 },
});
