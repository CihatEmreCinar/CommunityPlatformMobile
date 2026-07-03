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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { socialService } from '../../../services/socialService';
import { postService } from '../../../services/postService';
import { employerService } from '../../../services/employerService';
import { formatNotificationTime } from '../../../utils/notificationUtils';
import type { Post, UserSocialStats } from '../../../types/post.types';
import type { EmployerPublicProfile } from '../../../services/employerService';

const ACCENT = '#6366F1';

// ─── Mini post kartı ──────────────────────────────────────────────────────────
// NOT: backend alanları → caption (content değil), publishedAt (createdAt değil)

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  return (
    <View style={styles.postCard}>
      <Text style={styles.postContent} numberOfLines={4}>{post.caption}</Text>
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

// ─── Ana ekran ────────────────────────────────────────────────────────────────

export default function EmployerPublicProfileScreen() {
  const router = useRouter();
  const { id: employerId } = useLocalSearchParams<{ id: string }>();

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
    } catch {
      // sessiz hata
    } finally {
      setLoadingProfile(false);
    }
  }, [employerId]);

  // ─── İstatistikler ─────────────────────────────────────────────────────────
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

  // ─── Postlar ───────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async (reset = false) => {
    if (!employerId) return;
    const cursor = reset ? null : cursorRef.current;
    if (reset) setLoadingPosts(true);
    else setLoadingMore(true);
    try {
      const result = await postService.getUserPosts(employerId, { cursor, limit: 15 });
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasNextPage);   // backend: hasNextPage
      if (reset) setPosts(result.posts); // backend: posts
      else setPosts((prev) => [...prev, ...result.posts]);
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
  }, []);

  // ─── Takip toggle ──────────────────────────────────────────────────────────
  const handleFollow = useCallback(async () => {
    if (!employerId || !stats) return;
    const wasFollowing = stats.isFollowedByMe;

    // Optimistic
    setStats((prev) =>
      prev
        ? {
            ...prev,
            isFollowedByMe: !prev.isFollowedByMe,
            followerCount: wasFollowing
              ? prev.followerCount - 1
              : prev.followerCount + 1,
          }
        : prev
    );

    setFollowLoading(true);
    try {
      await socialService.toggleFollow(employerId);
    } catch {
      // Rollback
      setStats((prev) =>
        prev
          ? {
              ...prev,
              isFollowedByMe: wasFollowing,
              followerCount: wasFollowing
                ? prev.followerCount + 1
                : prev.followerCount - 1,
            }
          : prev
      );
    } finally {
      setFollowLoading(false);
    }
  }, [employerId, stats]);

  // ─── Like toggle ───────────────────────────────────────────────────────────
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
        prev.map((p) =>
          p.id === postId ? { ...p, isLikedByMe: result.liked, likeCount: result.likeCount } : p
        )
      );
    } catch {
      // Rollback
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLikedByMe: !p.isLikedByMe, likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        )
      );
    }
  }, []);

  // ─── Header ────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View>
      {/* Geri + paylaş */}
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

      {/* Avatar + takip butonu */}
      <View style={styles.profileTop}>
        {profile?.profileImageUrl ? (
          <Image source={{ uri: profile.profileImageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>
              {(profile?.firstName?.[0] ?? 'E')}{(profile?.lastName?.[0] ?? '')}
            </Text>
          </View>
        )}
        {loadingStats ? (
          <ActivityIndicator color={ACCENT} />
        ) : (
          <TouchableOpacity
            style={[
              styles.followBtn,
              stats?.isFollowedByMe && styles.followingBtn,
            ]}
            onPress={handleFollow}
            disabled={followLoading}
            activeOpacity={0.8}
          >
            {followLoading ? (
              <ActivityIndicator size="small" color={stats?.isFollowedByMe ? ACCENT : '#FFFFFF'} />
            ) : (
              <>
                <Ionicons
                  name={stats?.isFollowedByMe ? 'checkmark' : 'person-add-outline'}
                  size={16}
                  color={stats?.isFollowedByMe ? ACCENT : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.followBtnText,
                    stats?.isFollowedByMe && styles.followingBtnText,
                  ]}
                >
                  {stats?.isFollowedByMe ? 'Takip Ediliyor' : 'Takip Et'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* İsim + rol */}
      <View style={styles.nameSection}>
        <Text style={styles.fullName}>
          {profile ? `${profile.firstName} ${profile.lastName}` : 'Eğitmen Profili'}
        </Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Eğitmen</Text>
        </View>
      </View>

      {profile?.workshopTitle ? (
        <Text style={styles.workshopTitleText}>{profile.workshopTitle}</Text>
      ) : null}

      {profile?.bio ? (
        <Text style={styles.bioText}>{profile.bio}</Text>
      ) : null}

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

      {/* Sosyal sayaçlar */}
      {loadingProfile || loadingStats ? (
        <ActivityIndicator color={ACCENT} style={{ marginVertical: 14 }} />
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.postCount ?? 0}</Text>
            <Text style={styles.statLabel}>Gönderi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.followerCount ?? 0}</Text>
            <Text style={styles.statLabel}>Takipçi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.followingCount ?? 0}</Text>
            <Text style={styles.statLabel}>Takip</Text>
          </View>
        </View>
      )}

      {/* Postlar başlık */}
      <View style={styles.postsSectionHeader}>
        <Ionicons name="grid-outline" size={16} color="#6B7280" />
        <Text style={styles.postsSectionTitle}>Gönderiler</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  listContent: { paddingBottom: 32 },

  // ─── Top bar ───────────────────────────────────────────────────────────────
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#FFFFFF' },

  // ─── Profil ────────────────────────────────────────────────────────────────
  profileTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  avatarInitials: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },

  // ─── Follow ────────────────────────────────────────────────────────────────
  followBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, minWidth: 130, justifyContent: 'center' },
  followingBtn: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: ACCENT },
  followBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  followingBtnText: { color: ACCENT },

  // ─── İsim ──────────────────────────────────────────────────────────────────
  nameSection: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  fullName: { fontSize: 17, fontWeight: '700', color: '#111827' },
  roleBadge: { backgroundColor: '#EEF2FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  roleText: { fontSize: 11, fontWeight: '600', color: ACCENT },
  workshopTitleText: { fontSize: 13, color: '#6B7280', paddingHorizontal: 16, paddingBottom: 6, backgroundColor: '#FFFFFF' },
  bioText: { fontSize: 13, color: '#374151', lineHeight: 19, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  tagRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  profileChip: { backgroundColor: '#EEF2FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  profileChipText: { fontSize: 12, color: ACCENT, fontWeight: '500' },
  categoryChip: { backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  categoryChipText: { fontSize: 12, color: '#4B5563', fontWeight: '500' },

  // ─── Stats ─────────────────────────────────────────────────────────────────
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB' },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statDivider: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: '#E5E7EB' },

  // ─── Posts section ─────────────────────────────────────────────────────────
  postsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14, backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB', marginTop: 8 },
  postsSectionTitle: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // ─── Post kartı ────────────────────────────────────────────────────────────
  postCard: { backgroundColor: '#FFFFFF', marginHorizontal: 8, marginTop: 8, borderRadius: 10, padding: 14, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  postContent: { fontSize: 14, color: '#374151', lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: { backgroundColor: '#EEF2FF', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 11, color: ACCENT, fontWeight: '500' },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { fontSize: 12, color: '#9CA3AF' },
  postTime: { marginLeft: 'auto', fontSize: 11, color: '#9CA3AF' },

  // ─── Empty ─────────────────────────────────────────────────────────────────
  empty: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 48 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});