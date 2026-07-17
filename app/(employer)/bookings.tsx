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
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { spaceBookingService, type SpaceBooking } from '../../services/spaceBookingService';
import { spaceBookingReviewService } from '../../services/spaceBookingReviewService';
import { getSpaceBookingStatusStyle } from '../../utils/spaceBookingStatus';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

// Approved + süresi geçmiş, ya da doğrudan Completed olan ve henüz review'ı olmayan
// rezervasyonlar değerlendirilebilir.
function canReview(booking: SpaceBooking): boolean {
  if (booking.hasReview) return false;
  if (booking.status === 'Completed') return true;
  if (booking.status === 'Approved') {
    return new Date(booking.endDateTime).getTime() < Date.now();
  }
  return false;
}

export default function EmployerBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<SpaceBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<SpaceBooking | null>(null);

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

  function handleReviewed(bookingId: string) {
    // Optimistic güncelleme: "Değerlendir" butonu backend'in hasReview alanı
    // olmadan da anında kaybolsun diye.
    setBookings((prev) =>
      prev.map((item) => (item.id === bookingId ? { ...item, hasReview: true } : item))
    );
    setReviewTarget(null);
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
            <Icon name="arrowBack" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Rezervasyonlarım</Text>
          <View style={{ width: 40 }} />
        </View>

        {bookings.length === 0 ? (
          <EmptyState
            icon="eventBusy"
            title="Rezervasyon yok"
            description="Bir mekan bulup rezervasyon talebi oluşturabilirsin."
            titleMarginTop={Spacing.sm}
            style={styles.emptyState}
          />
        ) : (
          bookings.map((item) => {
            const statusStyle = getSpaceBookingStatusStyle(item.status);
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.spaceListingTitle ?? 'Alan'}</Text>
                    <Text style={styles.cardSubtitle}>{item.cafeName ?? 'Kafe'}</Text>
                  </View>
                  <Badge label={statusStyle.label} color={statusStyle.color} backgroundColor={statusStyle.bg} />
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
                    <Button
                      style={styles.flexOne}
                      color="danger"
                      label="İptal Et"
                      disabled={actionId === item.id}
                      onPress={() => handleCancel(item.id)}
                    />
                  </View>
                ) : null}

                {canReview(item) ? (
                  <View style={styles.cardActions}>
                    <Button
                      style={styles.flexOne}
                      color="primary"
                      icon="starRate"
                      label="Değerlendir"
                      onPress={() => setReviewTarget(item)}
                    />
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      <SpaceBookingReviewModal
        booking={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSubmitted={handleReviewed}
      />
    </SafeAreaView>
  );
}

// ─── Cafe Review Modal ─────────────────────────────────────────────────────

function SpaceBookingReviewModal({
  booking,
  onClose,
  onSubmitted,
}: {
  booking: SpaceBooking | null;
  onClose: () => void;
  onSubmitted: (bookingId: string) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setRating(0);
      setComment('');
    }
  }, [booking?.id]);

  async function handleSubmit() {
    if (!booking) return;
    if (rating === 0) {
      Alert.alert('Hata', 'Lütfen bir puan seçin.');
      return;
    }
    setSubmitting(true);
    try {
      await spaceBookingReviewService.create(booking.id, {
        rating,
        comment: comment.trim() || undefined,
      });
      Alert.alert('Başarılı', 'Değerlendirmen kaydedildi.');
      onSubmitted(booking.id);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Değerlendirme gönderilemedi.';
      Alert.alert('Hata', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={!!booking} onClose={onClose} title="Kafeyi Değerlendir">
      <Text style={styles.modalCafeName}>{booking?.cafeName ?? 'Kafe'}</Text>
      <Text style={styles.modalListingTitle}>{booking?.spaceListingTitle ?? ''}</Text>

      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Icon name={star <= rating ? 'star' : 'starEmpty'} size={36} color={Colors.amber} />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.reviewInput}
        placeholder="Yorumunu yaz (opsiyonel)"
        placeholderTextColor={Colors.outlineVariant}
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
      />

      <Button
        style={styles.submitReviewButton}
        color="primary"
        label="Yorumu Gönder"
        loading={submitting}
        onPress={handleSubmit}
      />
    </Modal>
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
  emptyState: { paddingVertical: Spacing.xl * 1.5, gap: Spacing.sm },
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 13 },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  flexOne: { flex: 1 },

  // Review modal
  modalCafeName: { ...Typography.h2, color: Colors.onSurface },
  modalListingTitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm },
  starRow: { flexDirection: 'row', gap: Spacing.xs },
  reviewInput: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitReviewButton: { marginTop: Spacing.sm },
});
