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
import { employerService, type EmployerPublicProfile } from '../../services/employerService';
import { formatNotificationTime } from '../../utils/notificationUtils';
import type { Post, UserSocialStats } from '../../types/post.types';
import { ProfileHeader } from './ProfileHeader';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';
import { formatCityDistrict } from '../../utils/locationFormat';

const ACCENT = Colors.primary;

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
            <View key={t} style={styles.tagChip}><Text style={styles.tagText}>#{t}</Text></View>
          ))}
        </View>
      )}
      <View style={styles.postMeta}>
        <TouchableOpacity style={styles.postAction} onPress={() => onLike(post.id)}>
          <Icon name={post.isLikedByMe ? 'heartFilled' : 'heartOutline'} size={15} color={post.isLikedByMe ? '#EF4444' : Colors.outline} />
          <Text style={styles.postActionText}>{post.likeCount}</Text>
        </TouchableOpacity>
        <View style={styles.postAction}>
          <Icon name="chatbubbleOutline" size={15} color={Colors.outline} />
          <Text style={styles.postActionText}>{post.commentCount}</Text>
        </View>
        <Text style={styles.postTime}>{formatNotificationTime(post.publishedAt ?? '')}</Text>
      </View>
    </View>
  );
}

export function EmployerPublicProfileScreen({ employerId }: { employerId: string }) {
  const router = useRouter();

  const [profile, setProfile] = useState<EmployerPublicProfile | null>(null);
  const [stats, setStats] = useState<UserSocialStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const cursorRef = React.useRef<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!employerId) return;
    try {
      setProfile(await employerService.getPublicProfile(employerId));
    } catch (error) {
      console.log('EmployerPublicProfileScreen: profil alınamadı', employerId, error);
    } finally {
      setLoadingProfile(false);
    }
  }, [employerId]);

  const fetchStats = useCallback(async () => {
    if (!employerId) return;
    try {
      setStats(await postService.getSocialStats(employerId));
    } catch {
      // sessiz hata
    } finally {
      setLoadingStats(false);
    }
  }, [employerId]);

  const fetchPosts = useCallback(async (reset = false) => {
    if (!employerId) return;
    const cursor = reset ? null : cursorRef.current;
    if (reset) setLoadingPosts(true);
    else setLoadingMore(true);
    try {
      const result = await postService.getUserPosts(employerId, { cursor, limit: 15 });
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
  }, [employerId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    cursorRef.current = null;
    await Promise.all([fetchProfile(), fetchStats(), fetchPosts(true)]);
    setRefreshing(false);
  }, [fetchProfile, fetchStats, fetchPosts]);

  useEffect(() => { fetchProfile(); fetchStats(); fetchPosts(true); }, [employerId]);

  const handleFollow = useCallback(async () => {
    if (!employerId || !stats) return;
    const wasFollowing = stats.isFollowedByMe;
    setStats((prev) => (prev ? { ...prev, isFollowedByMe: !prev.isFollowedByMe, followerCount: wasFollowing ? prev.followerCount - 1 : prev.followerCount + 1 } : prev));
    setFollowLoading(true);
    try {
      await socialService.toggleFollow(employerId);
    } catch {
      setStats((prev) => (prev ? { ...prev, isFollowedByMe: wasFollowing, followerCount: wasFollowing ? prev.followerCount + 1 : prev.followerCount - 1 } : prev));
    } finally {
      setFollowLoading(false);
    }
  }, [employerId, stats]);

  const handleMessage = useCallback(() => {
    Alert.alert('Yakında', 'Mesajlaşma özelliği yakında eklenecek.');
  }, []);

  const handleLike = useCallback(async (postId: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isLikedByMe: !p.isLikedByMe, likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1 } : p)));
    try {
      const result = await socialService.toggleLike(postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isLikedByMe: result.liked, likeCount: result.likeCount } : p)));
    } catch {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isLikedByMe: !p.isLikedByMe, likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1 } : p)));
    }
  }, []);

  const renderHeader = () => (
    <View>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.topBarBtn}>
          <Icon name="arrowBackAlt" size={20} color={Colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Share.share({ message: `Atolium'da bu eğitmeni keşfet!` })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.topBarBtn}>
          <Icon name="shareSocialOutline" size={19} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ProfileHeader
        coverUrl={profile?.coverImageUrl}
        avatarUrl={profile?.profileImageUrl}
        fullName={profile ? `${profile.firstName} ${profile.lastName}` : 'Eğitmen Profili'}
        roleLabel="Eğitmen"
        bio={profile?.bio}
        city={formatCityDistrict(profile?.city, profile?.district)}
        stats={[
          { label: 'Atölye', value: profile?.totalWorkshops ?? 0 },
          { label: 'Gönderi', value: stats?.postCount ?? 0 },
          { label: 'Takipçi', value: stats?.followerCount ?? 0 },
          { label: 'Takip', value: stats?.followingCount ?? 0 },
        ]}
        actions={{ variant: 'other', isFollowing: stats?.isFollowedByMe ?? false, followLoading: followLoading || loadingStats, onFollow: handleFollow, onMessage: handleMessage }}
        extra={
          <>
            {profile?.specialization?.length ? (
              <View style={styles.tagRowWrap}>
                {profile.specialization.map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.profileChip}><Text style={styles.profileChipText}>{item}</Text></View>
                ))}
              </View>
            ) : null}
            {profile?.categoryNames?.length ? (
              <View style={styles.tagRowWrap}>
                {profile.categoryNames.map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.categoryChip}><Text style={styles.categoryChipText}>{item}</Text></View>
                ))}
              </View>
            ) : null}
          </>
        }
      />

      <View style={styles.postsSectionHeader}>
        <Icon name="gridOutline" size={15} color={Colors.onSurfaceVariant} />
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
              <Icon name="newspaperOutline" size={40} color={Colors.outline} />
              <Text style={styles.emptyText}>Henüz gönderi paylaşılmamış</Text>
            </View>
          ) : null
        }
        ListFooterComponent={loadingPosts ? <ActivityIndicator color={ACCENT} style={{ marginVertical: 24 }} /> : loadingMore ? <ActivityIndicator color={ACCENT} style={{ marginVertical: 16 }} /> : null}
        onEndReached={() => { if (hasMore && !loadingMore) fetchPosts(); }}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      {loadingProfile ? (
        <View style={styles.loadingOverlay} pointerEvents="none"><ActivityIndicator color={ACCENT} /></View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingBottom: 32 },
  loadingOverlay: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.xs, backgroundColor: Colors.background },
  topBarBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  tagRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  profileChip: { backgroundColor: Pastel.teal.tintStrong, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  profileChipText: { ...Typography.labelSm, color: Pastel.teal.text, fontWeight: '600' },
  categoryChip: { backgroundColor: Colors.surfaceContainer, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  categoryChipText: { ...Typography.labelSm, color: Colors.onSurfaceVariant, fontWeight: '600' },
  postsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: Spacing.md, marginTop: Spacing.sm },
  postsSectionTitle: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  postCard: { backgroundColor: Pastel.teal.tint, marginHorizontal: Spacing.sm, marginTop: Spacing.sm, borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.sm },
  postContent: { ...Typography.bodyMd, color: Colors.onSurface, lineHeight: 20 },
  postMediaRow: { flexDirection: 'row', gap: 6 },
  postMediaThumb: { width: 88, height: 88, borderRadius: Radius.lg, backgroundColor: Colors.surfaceContainer },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: { backgroundColor: Pastel.teal.tintStrong, borderRadius: Radius.md, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { ...Typography.labelSm, color: Pastel.teal.text, fontWeight: '600' },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  postTime: { marginLeft: 'auto', ...Typography.labelSm, color: Colors.outline },
  empty: { alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingTop: 48 },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
});
