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
import { Icon } from '../../../components/ui/Icon';
import { workshopService } from '../../../services/workshopService';
import { reviewService } from '../../../services/reviewService';
import { Workshop } from '../../../types/workshop';
import { Review } from '../../../types/review';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCityDistrict, openMapsForCoordinate } from '../../../utils/locationFormat';

export default function EmployerWorkshopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    try {
      const [w, r] = await Promise.all([workshopService.getById(id), reviewService.getAll(id)]);
      setWorkshop(w);
      setReviews(r);
    } catch (error) {
      if (__DEV__) console.log('Veri yüklenemedi', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReply(reviewId: string) {
    const reply = replyDrafts[reviewId]?.trim();
    if (!reply) { Alert.alert('Hata', 'Yanıt boş olamaz.'); return; }
    setSubmittingId(reviewId);
    try {
      await reviewService.reply(id, reviewId, { reply });
      await loadData();
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (error: any) {
      Alert.alert('Hata', error?.response?.data?.message || 'Yanıt gönderilemedi.');
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowBack" size={20} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{workshop.title}</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workshop.enrolledCount}/{workshop.capacity}</Text>
          <Text style={styles.statLabel}>Katılımcı</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workshop.avgRating > 0 ? workshop.avgRating.toFixed(1) : '—'}</Text>
          <Text style={styles.statLabel}>Puan</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{reviews.length}</Text>
          <Text style={styles.statLabel}>Yorum</Text>
        </View>
      </View>

      {workshop.locationType === 'in-person' && (workshop.address || workshop.venueName) && (
        <View style={styles.locationCard}>
          <View style={styles.locationCardRow}>
            <Icon name="place" size={15} color={Pastel.coral.text} />
            <View style={{ flex: 1 }}>
              {workshop.venueName ? <Text style={styles.locationCardTitle}>{workshop.venueName}</Text> : null}
              {workshop.address ? <Text style={styles.locationCardText}>{workshop.address}</Text> : null}
              {formatCityDistrict(workshop.city, workshop.district) ? (
                <Text style={styles.locationCardText}>{formatCityDistrict(workshop.city, workshop.district)}</Text>
              ) : null}
            </View>
          </View>
          {workshop.latitude != null && workshop.longitude != null && (
            <TouchableOpacity
              style={styles.locationCardMapBtn}
              onPress={() => openMapsForCoordinate(workshop.latitude!, workshop.longitude!, workshop.venueName || workshop.title)}
              activeOpacity={0.7}
            >
              <Icon name="map" size={13} color={Pastel.coral.text} />
              <Text style={styles.locationCardMapBtnText}>Haritada Göster</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.participantsButton}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/(employer)/workshop/participants', params: { id: workshop.id, title: workshop.title } })}
      >
        <Icon name="qrCodeScanner" size={19} color={Colors.onPrimary} />
        <Text style={styles.participantsButtonText}>Katılımcılar</Text>
      </TouchableOpacity>

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
                    <Icon key={star} name={star <= r.rating ? 'star' : 'starEmpty'} size={13} color={Colors.amber} />
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
                    placeholderTextColor={Colors.outline}
                    value={replyDrafts[r.id] || ''}
                    onChangeText={(text) => setReplyDrafts((prev) => ({ ...prev, [r.id]: text }))}
                    multiline
                  />
                  <TouchableOpacity style={styles.replyButton} onPress={() => handleReply(r.id)} disabled={submittingId === r.id} activeOpacity={0.85}>
                    {submittingId === r.id ? <ActivityIndicator size="small" color={Colors.onPrimary} /> : <Text style={styles.replyButtonText}>Yanıtla</Text>}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  container: { paddingHorizontal: Spacing.containerMargin, paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, gap: Spacing.sm },
  backButton: { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...Typography.serifTitle, color: Colors.onSurface, flex: 1, textAlign: 'center' },
  statsRow: { flexDirection: 'row', backgroundColor: Pastel.teal.tint, borderRadius: Radius.xxl, paddingVertical: Spacing.md, marginBottom: Spacing.lg },
  statItem: { flex: 1, alignItems: 'center' },
  locationCard: { marginTop: Spacing.sm, marginBottom: Spacing.lg, backgroundColor: Pastel.coral.tint, borderRadius: Radius.xxl, padding: Spacing.sm, gap: Spacing.xs },
  locationCardRow: { flexDirection: 'row', gap: Spacing.xs },
  locationCardTitle: { ...Typography.labelMd, color: Colors.onSurface },
  locationCardText: { ...Typography.labelSm, color: Colors.onSurfaceVariant, lineHeight: 16 },
  locationCardMapBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginLeft: 22 },
  locationCardMapBtnText: { ...Typography.labelSm, color: Pastel.coral.text, fontWeight: '600' },
  statValue: { ...Typography.h2, color: Colors.onSurface },
  statLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: 2 },
  participantsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: Spacing.sm + 2, marginBottom: Spacing.lg },
  participantsButtonText: { ...Typography.labelMd, color: Colors.onPrimary },
  reviewsSection: { gap: Spacing.sm },
  sectionTitle: { ...Typography.serifTitle, color: Colors.onSurface },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  reviewCard: { backgroundColor: Pastel.teal.tint, borderRadius: Radius.xxl, padding: Spacing.sm, gap: Spacing.sm },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUserName: { ...Typography.labelMd, fontSize: 14, color: Colors.onSurface },
  reviewStars: { flexDirection: 'row' },
  reviewComment: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  replyBox: { backgroundColor: Pastel.purple.tintStrong, borderRadius: Radius.lg, padding: Spacing.sm, gap: 2 },
  replyLabel: { ...Typography.labelSm, color: Pastel.purple.text, fontWeight: '700' },
  replyText: { ...Typography.bodySm, color: Pastel.purple.text },
  replyForm: { gap: Spacing.xs },
  replyInput: { ...Typography.bodyMd, color: Colors.onSurface, backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, minHeight: 60, textAlignVertical: 'top' },
  replyButton: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.xs, alignItems: 'center' },
  replyButtonText: { ...Typography.labelMd, color: Colors.onPrimary },
});
