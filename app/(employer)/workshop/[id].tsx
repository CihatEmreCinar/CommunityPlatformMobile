import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { workshopService } from '../../../services/workshopService';
import { reviewService } from '../../../services/reviewService';
import { Workshop } from '../../../types/workshop';
import { Review } from '../../../types/review';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmployerWorkshopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [w, r] = await Promise.all([
        workshopService.getById(id),
        reviewService.getAll(id),
      ]);
      setWorkshop(w);
      setReviews(r);
    } catch (error) {
      console.log('Veri yüklenemedi', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReply(reviewId: string) {
    const reply = replyDrafts[reviewId]?.trim();
    if (!reply) {
      Alert.alert('Hata', 'Yanıt boş olamaz.');
      return;
    }

    setSubmittingId(reviewId);
    try {
      await reviewService.reply(id, reviewId, { reply });
      await loadData();
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Yanıt gönderilemedi.';
      Alert.alert('Hata', message);
    } finally {
      setSubmittingId(null);
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {workshop.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workshop.enrolledCount}/{workshop.capacity}</Text>
          <Text style={styles.statLabel}>Katılımcı</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {workshop.avgRating > 0 ? workshop.avgRating.toFixed(1) : '—'}
          </Text>
          <Text style={styles.statLabel}>Puan</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{reviews.length}</Text>
          <Text style={styles.statLabel}>Yorum</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.participantsButton}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: '/(employer)/workshop/participants',
            params: { id: workshop.id, title: workshop.title },
          })
        }
      >
        <MaterialIcons name="qr-code-scanner" size={20} color={Colors.onPrimary} />
        <Text style={styles.participantsButtonText}>Katılımcılar</Text>
      </TouchableOpacity>

      {/* Reviews */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Değerlendirmeler</Text>

        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>Henüz değerlendirme yok.</Text>
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

              {r.employerReply ? (
                <View style={styles.replyBox}>
                  <Text style={styles.replyLabel}>Senin Yanıtın</Text>
                  <Text style={styles.replyText}>{r.employerReply}</Text>
                </View>
              ) : (
                <View style={styles.replyForm}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Bu yoruma yanıt yaz..."
                    placeholderTextColor={Colors.outlineVariant}
                    value={replyDrafts[r.id] || ''}
                    onChangeText={(text) =>
                      setReplyDrafts((prev) => ({ ...prev, [r.id]: text }))
                    }
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.replyButton}
                    onPress={() => handleReply(r.id)}
                    disabled={submittingId === r.id}
                    activeOpacity={0.85}
                  >
                    {submittingId === r.id ? (
                      <ActivityIndicator size="small" color={Colors.onPrimary} />
                    ) : (
                      <Text style={styles.replyButtonText}>Yanıtla</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
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
  container: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
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
  headerTitle: {
    ...Typography.h3,
    color: Colors.onSurface,
    flex: 1,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.surfaceVariant },
  statValue: { ...Typography.h2, color: Colors.onSurface },
  statLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: 2 },
  participantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  participantsButtonText: { ...Typography.labelMd, color: Colors.onPrimary },
  reviewsSection: { gap: Spacing.sm },
  sectionTitle: { ...Typography.h3, color: Colors.onSurface },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.sm,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewUserName: { ...Typography.labelMd, fontSize: 14, color: Colors.onSurface },
  reviewStars: { flexDirection: 'row' },
  reviewComment: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  replyBox: {
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
  replyForm: { gap: Spacing.xs },
  replyInput: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  replyButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  replyButtonText: { ...Typography.labelMd, color: Colors.onPrimary },
});