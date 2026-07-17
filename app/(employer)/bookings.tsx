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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/ui/Icon';
import { spaceBookingService, type SpaceBooking, type SpaceBookingStatus } from '../../services/spaceBookingService';
import { spaceBookingReviewService } from '../../services/spaceBookingReviewService';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_LABELS: Record<SpaceBookingStatus, { label: string; color: string; bg: string }> = {
  Pending: { label: 'Bekliyor', color: Colors.secondary, bg: Colors.secondaryContainer },
  Approved: { label: 'Onaylandı', color: Colors.primary, bg: Colors.primaryContainer },
  Rejected: { label: 'Reddedildi', color: Colors.error, bg: Colors.errorContainer },
  Cancelled: { label: 'İptal', color: Colors.outline, bg: Colors.surfaceContainer },
  Completed: { label: 'Tamamlandı', color: '#0F766E', bg: '#CCFBF1' },
};

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
          <View style={styles.emptyState}>
            <Icon name="eventBusy" size={40} color={Colors.outline} />
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
                      style={[styles.actionButton, styles.cancelButton]}
                      disabled={actionId === item.id}
                      onPress={() => handleCancel(item.id)}
                    >
                      <Text style={styles.actionText}>İptal Et</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {canReview(item) ? (
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.reviewButton]}
                      onPress={() => setReviewTarget(item)}
                    >
                      <Icon name="starRate" size={16} color={Colors.onPrimary} />
                      <Text style={styles.actionText}>Değerlendir</Text>
                    </TouchableOpacity>
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
    <Modal
      visible={!!booking}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Kafeyi Değerlendir</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="closeModal" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <Text style={styles.modalCafeName}>{booking?.cafeName ?? 'Kafe'}</Text>
          <Text style={styles.modalListingTitle}>{booking?.spaceListingTitle ?? ''}</Text>

          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Icon
                  name={star <= rating ? 'star' : 'starEmpty'}
                  size={36}
                  color={Colors.amber}
                />
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

          <TouchableOpacity
            style={[styles.submitReviewButton, submitting && styles.enrollButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <Text style={styles.submitReviewButtonText}>Yorumu Gönder</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  reviewButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    gap: 6,
  },
  actionText: { ...Typography.labelMd, color: '#FFFFFF' },

  // Review modal
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.containerMargin,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  modalTitle: { ...Typography.h3, color: Colors.onSurface },
  modalBody: { padding: Spacing.containerMargin, gap: Spacing.sm },
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
  submitReviewButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitReviewButtonText: { ...Typography.labelMd, color: Colors.onPrimary },
  enrollButtonDisabled: { backgroundColor: Colors.outline },
});
