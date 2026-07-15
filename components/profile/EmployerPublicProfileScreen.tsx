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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { socialService } from '../../services/socialService';
import { postService } from '../../services/postService';
import { employerService, type EmployerPublicProfile } from '../../services/employerService';
import { formatNotificationTime } from '../../utils/notificationUtils';
import type { Post, UserSocialStats } from '../../types/post.types';
import { ProfileHeader } from './ProfileHeader';
import { formatCityDistrict } from '../../utils/locationFormat';

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

// ─── Mini post kartı ──────────────────────────────────────────────────────────

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
          <Ionicons
            name={post.isLikedByMe ? 'heart' : 'heart-outline'}
            size={16}
            color={post.isLikedByMe ? '#EF4444' : '#9CA3AF'}
          />
          <Text style={styles.postActionText}>{post.likeCount}</Text>
        </TouchableOpacity>
        <View style={styles.postAction}>
          <Ionicons name="chatbubble-outline" size={16} color="#9CA3AF" />
          <Text style={styles.postActionText}>{post.commentCount}</Text>
        </View>
        <Text style={styles.postTime}>{formatNotificationTime(post.publishedAt ?? '')}</Text>
      </View>
    </View>
  );
}

// ─── Ana içerik (route-bağımsız — employer/employee/cafe grupları bunu sarar) ─

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
      const result = await employerService.getPublicProfile(employerId);
      setProfile(result);
    } catch (error) {
      // NOT: Önceden tamamen sessizdi — 404 gibi durumlarda kullanıcı hiçbir
      // hata görmeden jenerik "Eğitmen Profili" fallback'ine düşüyordu ve bu
      // durum bir routing bug'ı gibi görünüyordu. En azından logla.
      console.log('EmployerPublicProfileScreen: profil alınamadı', employerId, error);
    } finally {
      setLoadingProfile(false);
    }
  }, [employerId]);

  const fetchStats = useCallback(async () => {
    if (!employerId) return;
    try {
      const s = await postService.getSocialStats(employerId);
      setStats(s);
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

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchPosts(true);
  }, [employerId]);

  const handleFollow = useCallback(async () => {
    if (!employerId || !stats) return;
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
      await socialService.toggleFollow(employerId);
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
  }, [employerId, stats]);

  const handleMessage = useCallback(() => {
    // NOT: Uygulamada henüz bir mesajlaşma/DM sistemi yok — bu buton spec'te
    // istendiği için eklendi, backend hazır olunca burası wire edilebilir.
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
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Share.share({ message: `Atolium'da bu eğitmeni keşfet!` })}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="share-social-outline" size={22} color="#374151" />
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
        actions={{
          variant: 'other',
          isFollowing: stats?.isFollowedByMe ?? false,
          followLoading: followLoading || loadingStats,
          onFollow: handleFollow,
          onMessage: handleMessage,
        }}
        extra={
          <>
            {profile?.specialization?.length ? (
              <View style={styles.tagRowWrap}>
                {profile.specialization.map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.profileChip}>
                    <Text style={styles.profileChipText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {profile?.categoryNames?.length ? (
              <View style={styles.tagRowWrap}>
                {profile.categoryNames.map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        }
      />

      <View style={styles.postsSectionHeader}>
        <Ionicons name="grid-outline" size={16} color="#6B7280" />
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
              <Ionicons name="newspaper-outline" size={44} color="#D1D5DB" />
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
  tagRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  profileChip: { backgroundColor: '#F0FDFA', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  profileChipText: { fontSize: 12, color: ACCENT, fontWeight: '500' },
  categoryChip: { backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  categoryChipText: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
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
