import { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Share, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { workshopService } from '../../../services/workshopService';
import { enrollmentService } from '../../../services/enrollmentService';
import { reviewService } from '../../../services/reviewService';
import { Workshop } from '../../../types/workshop';
import { Review } from '../../../types/review';
import { Enrollment } from '../../../types/enrollment';
import { Colors, Spacing } from '../../../constants/theme';
import { formatCityDistrict, openMapsForCoordinate } from '../../../utils/locationFormat';
import { WorkshopHero } from '../../../components/workshop/WorkshopHero';
import { WorkshopHeader } from '../../../components/workshop/WorkshopHeader';
import { WorkshopUrgencyCard } from '../../../components/workshop/WorkshopUrgencyCard';
import { WorkshopInfoGrid } from '../../../components/workshop/WorkshopInfoGrid';
import { WorkshopDescription } from '../../../components/workshop/WorkshopDescription';
import { WorkshopTags } from '../../../components/workshop/WorkshopTags';
import { WorkshopGallery } from '../../../components/workshop/WorkshopGallery';
import { WorkshopLocation } from '../../../components/workshop/WorkshopLocation';
import { WorkshopReviews } from '../../../components/workshop/WorkshopReviews';
import { WorkshopStickyCTA } from '../../../components/workshop/WorkshopStickyCTA';

function getWorkshopLocationLabel(workshop: Workshop): string {
  if (workshop.locationType === 'online') return 'Online';
  const parts = [workshop.venueName, workshop.address].filter((p): p is string => !!p?.trim());
  if (parts.length > 0) return parts.join(' — ');
  return workshop.locationDetail || '—';
}

export default function WorkshopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      if (__DEV__) console.log('Yorumlar yüklenemedi', error);
    }
  }

  async function checkEligibility() {
    try {
      const enrollments = await enrollmentService.getMine();
      const myEnrollment = enrollments.find((e) => e.workshopId === id);
      setCanReview(myEnrollment?.attendanceStatus === 'Attended');
      setEnrollmentStatus(myEnrollment?.status ?? null);
    } catch (error) {
      if (__DEV__) console.log('Kayıt durumu kontrol edilemedi', error);
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
      Alert.alert('Başarılı', message, [{ text: 'Tamam' }]);
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

  async function handleShare() {
    if (!workshop) return;
    try {
      await Share.share({ message: `Atolium'da "${workshop.title}" atölyesine göz at!` });
    } catch (error) {
      if (__DEV__) console.log('Paylaşım başarısız', error);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
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
  const enrollmentButtonText = canReview
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

  const isOnline = workshop.locationType === 'online';
  const cityDistrict = !isOnline ? formatCityDistrict(workshop.city, workshop.district) : null;
  const canOpenMaps = !isOnline && workshop.latitude != null && workshop.longitude != null;

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <WorkshopHero
          imageUrl={workshop.coverImageUrl}
          topInset={insets.top}
          onBack={() => router.back()}
          onShare={handleShare}
        />

        <View style={styles.card}>
          <WorkshopHeader
            title={workshop.title}
            employerName={workshop.employerName}
            onEmployerPress={() => router.push(`/(employee)/employer/${workshop.employerId}` as any)}
            locationLabel={isOnline ? 'Online' : cityDistrict}
            avgRating={workshop.avgRating}
            reviewCount={workshop.reviewCount}
          />

          <View style={styles.section}>
            <WorkshopUrgencyCard capacity={workshop.capacity} enrolledCount={workshop.enrolledCount} />
          </View>

          <View style={styles.section}>
            <WorkshopInfoGrid date={formattedDate} time={formattedTime} price={`${workshop.price} ₺`} />
          </View>

          <View style={styles.section}>
            <WorkshopDescription description={workshop.description} />
          </View>

          {workshop.tags.length > 0 && (
            <View style={styles.section}>
              <WorkshopTags tags={workshop.tags} />
            </View>
          )}

          <View style={styles.section}>
            <WorkshopGallery imageUrl={workshop.coverImageUrl} />
          </View>

          <View style={styles.section}>
            <WorkshopLocation
              isOnline={isOnline}
              label={getWorkshopLocationLabel(workshop)}
              cityDistrict={cityDistrict}
              onOpenMaps={
                canOpenMaps
                  ? () =>
                      openMapsForCoordinate(
                        workshop.latitude!,
                        workshop.longitude!,
                        workshop.venueName || workshop.title
                      )
                  : undefined
              }
            />
          </View>

          <View style={styles.section}>
            <WorkshopReviews
              reviews={reviews}
              showReviewForm={showReviewForm}
              rating={rating}
              onRatingChange={setRating}
              comment={comment}
              onCommentChange={setComment}
              isSubmittingReview={isSubmittingReview}
              onSubmitReview={handleSubmitReview}
            />
          </View>
        </View>
      </ScrollView>

      <WorkshopStickyCTA
        price={workshop.price}
        buttonText={enrollmentButtonText}
        disabled={enrollmentButtonDisabled}
        loading={isEnrolling}
        onPress={handleEnroll}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.surface },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  card: {
    marginTop: -32,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.md,
  },
  section: {
    marginTop: Spacing.lg,
  },
});
