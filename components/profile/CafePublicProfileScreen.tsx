import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Alert } from 'react-native';
import { Icon } from '../ui/Icon';
import { cafeProfileService, type CafePublicProfile } from '../../services/cafeProfileService';
import { spaceBookingReviewService } from '../../services/spaceBookingReviewService';
import type { SpaceBookingReview } from '../../types/spaceBookingReview';
import { ProfileHeader } from './ProfileHeader';
import { PublicProfileLayout } from './PublicProfileLayout';
import { usePublicProfile } from '../../hooks/usePublicProfile';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';
import { formatCityDistrict, openMapsForCoordinate } from '../../utils/locationFormat';

export function CafePublicProfileScreen({ cafeId }: { cafeId: string }) {
  const [reviews, setReviews] = useState<SpaceBookingReview[]>([]);

  const fetchReviews = useCallback(async () => {
    if (!cafeId) return;
    try {
      setReviews(await spaceBookingReviewService.getByCafeProfile(cafeId));
    } catch {
      // sessiz hata
    }
  }, [cafeId]);

  const {
    profile, stats, posts, loadingProfile, loadingStats, loadingPosts, loadingMore,
    followLoading, refreshing, loadMore, refresh, handleFollow, handleLike,
  } = usePublicProfile<CafePublicProfile>({
    userId: cafeId,
    fetchProfile: (id) => cafeProfileService.getPublicProfile(id),
    extraFetchers: [fetchReviews],
  });

  const handleMessage = useCallback(() => {
    Alert.alert('Yakında', 'Mesajlaşma özelliği yakında eklenecek.');
  }, []);

  const header = (
    <>
      <ProfileHeader
        coverUrl={profile?.coverImageUrl}
        avatarUrl={profile?.avatarUrl}
        fullName={profile?.name ?? 'Kafe Profili'}
        roleLabel="Kafe"
        bio={profile?.bio}
        city={formatCityDistrict(profile?.city, profile?.district)}
        stats={[
          { label: 'Gönderi', value: stats?.postCount ?? 0 },
          { label: 'Takipçi', value: stats?.followerCount ?? 0 },
          { label: 'Takip', value: stats?.followingCount ?? 0 },
        ]}
        actions={{ variant: 'other', isFollowing: stats?.isFollowedByMe ?? false, followLoading: followLoading || loadingStats, onFollow: handleFollow, onMessage: handleMessage }}
        extra={
          !!profile?.avgRating && profile.avgRating > 0 ? (
            <View style={styles.ratingRow}>
              <Icon name="star" size={15} color={Colors.amber} />
              <Text style={styles.ratingText}>{profile.avgRating.toFixed(1)} ({profile.reviewCount ?? 0} değerlendirme)</Text>
            </View>
          ) : null
        }
      />

      {profile?.address ? (
        <View style={styles.addressRow}>
          <Icon name="locationOutline" size={15} color={Pastel.coral.text} />
          <Text style={styles.addressText}>{profile.address}</Text>
          {profile.latitude != null && profile.longitude != null && (
            <TouchableOpacity onPress={() => openMapsForCoordinate(profile.latitude!, profile.longitude!, profile.name)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.mapLink}>Haritada Göster</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Değerlendirmeler {reviews.length > 0 ? `(${reviews.length})` : ''}</Text>
        {reviews.length === 0 ? (
          <Text style={styles.emptyReviewText}>Henüz değerlendirme yok.</Text>
        ) : (
          reviews.slice(0, 5).map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUserName}>{r.userName}</Text>
                <View style={{ flexDirection: 'row' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon key={star} name={star <= r.rating ? 'star' : 'starEmpty'} size={12} color={Colors.amber} />
                  ))}
                </View>
              </View>
              {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
            </View>
          ))
        )}
      </View>
    </>
  );

  return (
    <PublicProfileLayout
      accent={Pastel.coral}
      shareMessage="Atolium'da bu kafeyi keşfet!"
      header={header}
      posts={posts}
      loadingProfile={loadingProfile}
      loadingPosts={loadingPosts}
      loadingMore={loadingMore}
      refreshing={refreshing}
      onRefresh={refresh}
      onLoadMore={loadMore}
      onLike={handleLike}
    />
  );
}

const styles = StyleSheet.create({
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ratingText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, marginTop: 4, flexWrap: 'wrap' },
  addressText: { ...Typography.bodySm, color: Colors.onSurfaceVariant, flexShrink: 1 },
  mapLink: { ...Typography.labelSmMd, color: Pastel.coral.text },
  reviewsSection: { padding: Spacing.md, gap: Spacing.sm, marginTop: Spacing.sm },
  sectionTitle: { ...Typography.serifTitle, color: Colors.onSurface },
  emptyReviewText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  reviewCard: { backgroundColor: Pastel.coral.tint, borderRadius: Radius.xl, padding: Spacing.sm, gap: 4 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUserName: { ...Typography.labelSmMd, color: Colors.onSurface },
  reviewComment: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
});
