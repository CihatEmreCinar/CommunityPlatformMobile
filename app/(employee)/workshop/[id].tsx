import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { workshopService } from '../../../services/workshopService';
import { enrollmentService } from '../../../services/enrollmentService';
import { reviewService } from '../../../services/reviewService';
import { Workshop } from '../../../types/workshop';
import { Review } from '../../../types/review';
import { Enrollment } from '../../../types/enrollment';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkshopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<Enrollment['status'] | null>(null);

  useEffect(() => {
    loadWorkshop();
    loadReviews();
    checkEligibility();
  }, [id]);

  async function loadWorkshop() {
    try {
      const data = await workshopService.getById(id);
      setWorkshop(data);
    } catch (error) {
      Alert.alert('Hata', 'Atölye bulunamadı.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }

  async function loadReviews() {
    try {
      const data = await reviewService.getAll(id);
      setReviews(data);
    } catch (error) {
      console.log('Yorumlar yüklenemedi', error);
    }
  }

async function checkEligibility() {
  try {
    const enrollments = await enrollmentService.getMine();
    const myEnrollment = enrollments.find((e) => e.workshopId === id);
    setCanReview(myEnrollment?.attendanceStatus === 'Attended');
    setEnrollmentStatus(myEnrollment?.status ?? null);
  } catch (error) {
    console.log('Kayıt durumu kontrol edilemedi', error);
  }
}

  async function handleEnroll() {
    if (!workshop) return;

    setIsEnrolling(true);
    try {
      const created = await enrollmentService.create({ workshopId: workshop.id });
      setEnrollmentStatus(created.status);
      const message =
        created.status === 'pending'
          ? 'Kayıt talebin gönderildi. Onay bekleniyor.'
          : 'Atölyeye kaydoldun!';
      Alert.alert('Başarılı', message, [
        { text: 'Tamam' },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Kayıt işlemi başarısız oldu.';
      Alert.alert('Hata', message);
    } finally {
      setIsEnrolling(false);
    }
  }

  async function handleSubmitReview() {
    if (rating === 0) {
      Alert.alert('Hata', 'Lütfen bir puan seçin.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewService.create(id, { rating, comment: comment.trim() || undefined });
      setRating(0);
      setComment('');
      setHasReviewed(true);
      await loadReviews();
      await loadWorkshop();
      Alert.alert('Başarılı', 'Yorumun eklendi.');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Yorum eklenemedi.';
      Alert.alert('Hata', message);
    } finally {
      setIsSubmittingReview(false);
    }
  }
  

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!workshop) return null;

  const isFull = workshop.enrolledCount >= workshop.capacity;
  const startDate = new Date(workshop.startAt);
  const endDate = new Date(workshop.endAt);
  const formattedDate = startDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = `${startDate.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })} - ${endDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;

  const showReviewForm = canReview && !hasReviewed;
  const isEnrolled = enrollmentStatus != null;
  const enrollmentButtonText =
    canReview
      ? 'Katıldın'
      : enrollmentStatus === 'pending'
      ? 'Onay Bekleniyor'
      : enrollmentStatus === 'confirmed'
      ? 'Kaydın Onaylandı'
      : enrollmentStatus === 'cancelled'
      ? 'Kayıt İptal Edildi'
      : isFull
      ? 'Kapasite Doldu'
      : 'Kaydol';
  const enrollmentButtonDisabled = isFull || isEnrolling || isEnrolled;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <View style={styles.flex}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with back button */}
        <View style={styles.headerImage}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerIconWrap}>
            <MaterialIcons name="palette" size={48} color={Colors.primary} />
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & Employer */}
          <Text style={styles.title}>{workshop.title}</Text>
          <TouchableOpacity
            style={styles.employerRow}
            onPress={() => router.push(`/(employee)/employer/${workshop.employerId}` as any)}
          >
            <MaterialIcons name="person" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.employerName}>{workshop.employerName}</Text>
            <MaterialIcons name="chevron-right" size={16} color={Colors.outline} />
          </TouchableOpacity>

          {/* Rating */}
          {workshop.avgRating > 0 && (
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={16} color={Colors.amber} />
              <Text style={styles.ratingText}>
                {workshop.avgRating.toFixed(1)} ({workshop.reviewCount} değerlendirme)
              </Text>
            </View>
          )}

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <InfoItem icon="calendar-today" label="Tarih" value={formattedDate} />
            <InfoItem icon="schedule" label="Saat" value={formattedTime} />
            <InfoItem
              icon={workshop.locationType === 'online' ? 'videocam' : 'place'}
              label="Konum"
              value={workshop.locationType === 'online' ? 'Online' : workshop.locationDetail || '—'}
            />
            <InfoItem
              icon="groups"
              label="Kapasite"
              value={`${workshop.enrolledCount}/${workshop.capacity} kişi`}
            />
          </View>

          {/* Description */}
          {workshop.description && (
            <View style={styles.descSection}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.description}>{workshop.description}</Text>
            </View>
          )}

          {/* Tags */}
          {workshop.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {workshop.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <View style={styles.reviewFormSection}>
              <Text style={styles.sectionTitle}>Deneyimini Paylaş</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <MaterialIcons
                      name={star <= rating ? 'star' : 'star-border'}
                      size={32}
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
                numberOfLines={3}
              />
              <TouchableOpacity
                style={[styles.submitReviewButton, isSubmittingReview && styles.enrollButtonDisabled]}
                onPress={handleSubmitReview}
                disabled={isSubmittingReview}
                activeOpacity={0.85}
              >
                {isSubmittingReview ? (
                  <ActivityIndicator color={Colors.onPrimary} />
                ) : (
                  <Text style={styles.submitReviewButtonText}>Yorumu Gönder</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Reviews List */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>
              Değerlendirmeler {reviews.length > 0 ? `(${reviews.length})` : ''}
            </Text>
            {reviews.length === 0 ? (
              <Text style={styles.emptyReviewText}>Henüz değerlendirme yok.</Text>
            ) : (
              reviews.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUserName}>{r.userName}</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <MaterialIcons
                          key={star}
                          name={star <= r.rating ? 'star' : 'star-border'}
                          size={14}
                          color={Colors.amber}
                        />
                      ))}
                    </View>
                  </View>
                  {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                  {r.employerReply && (
                    <View style={styles.replyBox}>
                      <Text style={styles.replyLabel}>Atölyeci Yanıtı</Text>
                      <Text style={styles.replyText}>{r.employerReply}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Fiyat</Text>
          <Text style={styles.priceValue}>{workshop.price} ₺</Text>
        </View>
        <TouchableOpacity
          style={[styles.enrollButton, enrollmentButtonDisabled && styles.enrollButtonDisabled]}
          onPress={handleEnroll}
          disabled={enrollmentButtonDisabled}
          activeOpacity={0.85}
        >
          {isEnrolling ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text style={styles.enrollButtonText}>{enrollmentButtonText}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconWrap}>
        <MaterialIcons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  container: { paddingBottom: 100 },
  headerImage: {
    height: 220,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.xl,
    left: Spacing.containerMargin,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
    zIndex: 10,
  },
  headerIconWrap: {
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Colors.onSurface,
  },
  employerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  employerName: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  infoItem: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.sm,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextWrap: { flex: 1 },
  infoLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
  },
  infoValue: {
    ...Typography.labelMd,
    color: Colors.onSurface,
    marginTop: 1,
  },
  descSection: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.onSurface,
  },
  description: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  tagText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  reviewFormSection: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
  },
  starRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  reviewInput: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitReviewButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  submitReviewButtonText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
  },
  reviewsSection: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyReviewText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.sm,
    gap: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewUserName: {
    ...Typography.labelMd,
    fontSize: 14,
    color: Colors.onSurface,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewComment: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  replyBox: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 2,
  },
  replyLabel: {
    ...Typography.labelSm,
    color: Colors.onPrimaryContainer,
    fontWeight: '700',
  },
  replyText: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: Colors.onPrimaryContainer,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
    ...Shadows.card,
  },
  priceLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
  },
  priceValue: {
    ...Typography.h2,
    color: Colors.primary,
  },
  enrollButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollButtonDisabled: {
    backgroundColor: Colors.outline,
  },
  enrollButtonText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
    fontSize: 14,
  },
});