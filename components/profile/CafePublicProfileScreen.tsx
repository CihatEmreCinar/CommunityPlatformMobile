import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
  Share,
  Alert,
} from 'react-native';
import { Icon } from '../ui/Icon';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { socialService } from '../../services/socialService';
import { postService } from '../../services/postService';
import { cafeProfileService, type CafePublicProfile } from '../../services/cafeProfileService';
import { spaceBookingReviewService } from '../../services/spaceBookingReviewService';
import type { SpaceBookingReview } from '../../types/spaceBookingReview';
import { formatNotificationTime } from '../../utils/notificationUtils';
import type { Post, UserSocialStats } from '../../types/post.types';
import { ProfileHeader } from './ProfileHeader';
import { Colors } from '../../constants/theme';
import { formatCityDistrict, openMapsForCoordinate } from '../../utils/locationFormat';

const ACCENT = '#0F766E';

function dedupePostsById(items: Post[]): Post[] {
  const seen = new Set<string>();
  const unique: Post[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
}

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  return (
    <View style={styles.postCard}>
      <Text style={styles.postContent} numberOfLines={4}>{post.caption}</Text>
      {post.media && post.media.length > 0 ? (
        <View style={styles.postMediaRow}>
          {post.media.slice(0, 3).map((m) => (
            <Image key={m.id} source={{ uri: m.url }} style={styles.postMediaThumb} resizeMode="cover" />
          ))}
        </View>
      ) : null}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagRow}>
          {post.tags.map((t) => (
            <View key={t} style={styles.tagChip}>
              <Text style={styles.tagText}>#{t}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.postMeta}>
        <TouchableOpacity style={styles.postAction} onPress={() => onLike(post.id)}>
          <Icon
            name={post.isLikedByMe ? 'heartFilled' : 'heartOutline'}
            size={16}
            color={post.isLikedByMe ? '#EF4444' : '#9CA3AF'}
          />
          <Text style={styles.postActionText}>{post.likeCount}</Text>
        </TouchableOpacity>
        <View style={styles.postAction}>
          <Icon name="chatbubbleOutline" size={16} color="#9CA3AF" />
          <Text style={styles.postActionText}>{post.commentCount}</Text>
        </View>
        <Text style={styles.postTime}>{formatNotificationTime(post.publishedAt ?? '')}</Text>
      </View>
    </View>
  );
}

/**
 * NOT: cafeProfileService.getPublicProfile ve dolayısıyla bu ekran, backend'de
 * henüz var olmayan bir endpoint'e dayanıyor (bkz. cafeProfileService.ts içindeki
 * not). Backend eklenince ekran ekstra değişiklik gerekmeden çalışır.
 */
export function CafePublicProfileScreen({ cafeId }: { cafeId: string }) {
  const router = useRouter();

  const [profile, setProfile] = useState<CafePublicProfile | null>(null);
  const [stats, setStats] = useState<UserSocialStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<SpaceBookingReview[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const cursorRef = React.useRef<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!cafeId) return;
    try {
      const result = await cafeProfileService.getPublicProfile(cafeId);
      setProfile(result);
    } catch {
      // sessiz hata
    } finally {
      setLoadingProfile(false);
    }
  }, [cafeId]);

  const fetchStats = useCallback(async () => {
    if (!cafeId) return;
    try {
      const s = await postService.getSocialStats(cafeId);
      setStats(s);
    } catch {
      // sessiz hata
    } finally {
      setLoadingStats(false);
    }
  }, [cafeId]);

  const fetchReviews = useCallback(async () => {
    if (!cafeId) return;
    try {
      const data = await spaceBookingReviewService.getByCafeProfile(cafeId);
      setReviews(data);
    } catch {
      // sessiz hata
    }
  }, [cafeId]);

  const fetchPosts = useCallback(async (reset = false) => {
    if (!cafeId) return;
    const cursor = reset ? null : cursorRef.current;
    if (reset) setLoadingPosts(true);
    else setLoadingMore(true);
    try {
      const result = await postService.getUserPosts(cafeId, { cursor, limit: 15 });
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasNextPage);
      if (reset) setPosts(dedupePostsById(result.posts));
      else setPosts((prev) => dedupePostsById([...prev, ...result.posts]));
    } catch {
      // sessiz hata
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  }, [cafeId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    cursorRef.current = null;
    await Promise.all([fetchProfile(), fetchStats(), fetchReviews(), fetchPosts(true)]);
    setRefreshing(false);
  }, [fetchProfile, fetchStats, fetchReviews, fetchPosts]);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchReviews();
    fetchPosts(true);
  }, [cafeId]);

  const handleFollow = useCallback(async () => {
    if (!cafeId || !stats) return;
    const wasFollowing = stats.isFollowedByMe;

    setStats((prev) =>
      prev
        ? {
            ...prev,
            isFollowedByMe: !prev.isFollowedByMe,
            followerCount: wasFollowing ? prev.followerCount - 1 : prev.followerCount + 1,
          }
        : prev
    );

    setFollowLoading(true);
    try {
      await socialService.toggleFollow(cafeId);
    } catch {
      setStats((prev) =>
        prev
          ? {
              ...prev,
              isFollowedByMe: wasFollowing,
              followerCount: wasFollowing ? prev.followerCount + 1 : prev.followerCount - 1,
            }
          : prev
      );
    } finally {
      setFollowLoading(false);
    }
  }, [cafeId, stats]);

  const handleMessage = useCallback(() => {
    Alert.alert('Yakında', 'Mesajlaşma özelliği yakında eklenecek.');
  }, []);

  const handleLike = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLikedByMe: !p.isLikedByMe, likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );
    try {
      const result = await socialService.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isLikedByMe: result.liked, likeCount: result.likeCount } : p))
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLikedByMe: !p.isLikedByMe, likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        )
      );
    }
  }, []);

  const renderHeader = () => (
    <View>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrowBackAlt" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Share.share({ message: `Atolium'da bu kafeyi keşfet!` })}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="shareSocialOutline" size={22} color="#374151" />
        </TouchableOpacity>
      </View>

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
        actions={{
          variant: 'other',
          isFollowing: stats?.isFollowedByMe ?? false,
          followLoading: followLoading || loadingStats,
          onFollow: handleFollow,
          onMessage: handleMessage,
        }}
        extra={
          !!profile?.avgRating && profile.avgRating > 0 ? (
            <View style={styles.ratingRow}>
              <Icon name="star" size={16} color={Colors.amber} />
              <Text style={styles.ratingText}>
                {profile.avgRating.toFixed(1)} ({profile.reviewCount ?? 0} değerlendirme)
              </Text>
            </View>
          ) : null
        }
      />

      {profile?.address ? (
        <View style={styles.addressRow}>
          <Icon name="locationOutline" size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.addressText}>{profile.address}</Text>
          {profile.latitude != null && profile.longitude != null && (
            <TouchableOpacity
              onPress={() => openMapsForCoordinate(profile.latitude!, profile.longitude!, profile.name)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.mapLink}>Haritada Göster</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>
          Değerlendirmeler {reviews.length > 0 ? `(${reviews.length})` : ''}
        </Text>
        {reviews.length === 0 ? (
          <Text style={styles.emptyReviewText}>Henüz değerlendirme yok.</Text>
        ) : (
          reviews.slice(0, 5).map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUserName}>{r.userName}</Text>
                <View style={{ flexDirection: 'row' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name={star <= r.rating ? 'star' : 'starEmpty'}
                      size={13}
                      color={Colors.amber}
                    />
                  ))}
                </View>
              </View>
              {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
            </View>
          ))
        )}
      </View>

      <View style={styles.postsSectionHeader}>
        <Icon name="gridOutline" size={16} color="#6B7280" />
        <Text style={styles.postsSectionTitle}>Gönderiler</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} onLike={handleLike} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loadingPosts ? (
            <View style={styles.empty}>
              <Icon name="newspaperOutline" size={44} color="#D1D5DB" />
              <Text style={styles.emptyText}>Henüz gönderi paylaşılmamış</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingPosts ? (
            <ActivityIndicator color={ACCENT} style={{ marginVertical: 24 }} />
          ) : loadingMore ? (
            <ActivityIndicator color={ACCENT} style={{ marginVertical: 16 }} />
          ) : null
        }
        onEndReached={() => { if (hasMore && !loadingMore) fetchPosts(); }}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      {loadingProfile ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  listContent: { paddingBottom: 32 },
  loadingOverlay: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginTop: 4, flexWrap: 'wrap' },
  addressText: { fontSize: 13, color: Colors.onSurfaceVariant, flexShrink: 1 },
  mapLink: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  ratingText: { fontSize: 14, color: '#6B7280' },
  reviewsSection: { padding: 14, backgroundColor: '#FFFFFF', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  emptyReviewText: { fontSize: 13, color: '#9CA3AF' },
  reviewCard: { backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6', padding: 10, gap: 4 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUserName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  reviewComment: { fontSize: 13, color: '#374151' },
  postsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14, backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB', marginTop: 8 },
  postsSectionTitle: { fontSize: 13, fontWeight: '600', color: '#374151' },
  postCard: { backgroundColor: '#FFFFFF', marginHorizontal: 8, marginTop: 8, borderRadius: 10, padding: 14, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  postContent: { fontSize: 14, color: '#374151', lineHeight: 20 },
  postMediaRow: { flexDirection: 'row', gap: 6 },
  postMediaThumb: { width: 92, height: 92, borderRadius: 10, backgroundColor: '#E5E7EB' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: { backgroundColor: '#F0FDFA', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 11, color: ACCENT, fontWeight: '500' },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { fontSize: 12, color: '#9CA3AF' },
  postTime: { marginLeft: 'auto', fontSize: 11, color: '#9CA3AF' },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 48 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});
