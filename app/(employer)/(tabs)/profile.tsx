import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, ScrollView, Image, Share,
} from 'react-native';
import { Icon } from '../../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postService } from '../../../services/postService';
import { formatNotificationTime } from '../../../utils/notificationUtils';
import type { Post, UserSocialStats } from '../../../types/post.types';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';
import { formatCityDistrict } from '../../../utils/locationFormat';

const ACCENT = '#0F766E';

type Tab = 'posts' | 'info';

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

// ─── Post kartı (mini) ───────────────────────────────────────────────────────

function MyPostCard({ post, onEdit, onDelete }: {
  post: Post;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postCardBody}>
        <Text style={styles.postContent} numberOfLines={3}>{post.caption}</Text>
        {post.workshopTitle ? (
          <View style={styles.workshopTag}>
            <Icon name="briefcaseOutline" size={11} color="#6B7280" />
            <Text style={styles.workshopTagText} numberOfLines={1}>{post.workshopTitle}</Text>
          </View>
        ) : null}
        {post.media && post.media.length > 0 ? (
          <View style={styles.postMediaRow}>
            {post.media.slice(0, 3).map((m) => (
              <Image key={m.id} source={{ uri: m.url }} style={styles.postMediaThumb} resizeMode="cover" />
            ))}
          </View>
        ) : null}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagRow}>
            {post.tags.map((t, index) => (
              <View key={`${t}-${index}`} style={styles.tagChip}><Text style={styles.tagText}>#{t}</Text></View>
            ))}
          </View>
        )}
        <View style={styles.postMeta}>
          <View style={styles.postStats}>
            <Icon name="heartOutline" size={13} color="#9CA3AF" />
            <Text style={styles.postStatText}>{post.likeCount}</Text>
            <Icon name="chatbubbleOutline" size={13} color="#9CA3AF" />
            <Text style={styles.postStatText}>{post.commentCount}</Text>
          </View>
          <Text style={styles.postTime}>{formatNotificationTime(post.publishedAt ?? '')}</Text>
        </View>
      </View>
      <View style={styles.postCardActions}>
        <TouchableOpacity onPress={() => onEdit(post.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.postActionBtn}>
          <Icon name="pencilOutline" size={18} color={ACCENT} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(post.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.postActionBtn}>
          <Icon name="trashOutline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Ana ekran ───────────────────────────────────────────────────────────────

export default function EmployerProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const profile = user?.employerProfile ?? null;

  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [stats, setStats] = useState<UserSocialStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const cursorRef = React.useRef<string | null>(null);

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const s = await postService.getSocialStats(user.id);
      setStats(s);
    } catch {
      // sessiz hata
    } finally {
      setLoadingStats(false);
    }
  }, [user?.id]);

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  const handleShare = useCallback(() => {
    const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    Share.share({ message: `${name || 'Bu eğitmeni'} Atolium'da keşfet!` });
  }, [user?.firstName, user?.lastName]);

  // ─── Postlar ───────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async (reset = false) => {
    if (!user?.id) return;
    if (!reset && (loadingPosts || loadingMore || !hasMore)) return;

    const cursor = reset ? null : cursorRef.current;
    if (reset) setLoadingPosts(true);
    else setLoadingMore(true);

    try {
      const result = await postService.getUserPosts(user.id, { cursor, limit: 15 });
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasNextPage);

      const incoming = dedupePostsById(result.posts);
      if (reset) {
        setPosts(incoming);
      } else {
        setPosts((prev) => dedupePostsById([...prev, ...incoming]));
      }
    } catch {
      // sessiz hata
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  }, [user?.id]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    cursorRef.current = null;
    await Promise.all([refreshUser(), fetchStats(), fetchPosts(true)]);
    setRefreshing(false);
  }, [refreshUser, fetchStats, fetchPosts]);

  useEffect(() => {
    fetchStats();
    fetchPosts(true);
  }, [fetchStats, fetchPosts]);

  const handleEdit = useCallback((id: string) => {
    // DÜZELTİLDİ: /(employer)/post/${id} — route group parantezi eklendi
    router.push(`/(employer)/post/${id}` as any);
  }, [router]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Gönderiyi sil', 'Bu gönderi kalıcı olarak silinecek.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await postService.delete(id);
            setPosts((prev) => prev.filter((p) => p.id !== id));
            setStats((prev) => prev ? { ...prev, postCount: Math.max(0, prev.postCount - 1) } : prev);
          } catch {
            Alert.alert('Hata', 'Gönderi silinemedi.');
          }
        },
      },
    ]);
  }, []);

  // ─── Header ────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View>
      <ProfileHeader
        coverUrl={profile?.coverImageUrl}
        avatarUrl={user?.avatarUrl}
        fullName={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
        roleLabel="Eğitmen"
        bio={user?.bio}
        city={formatCityDistrict(user?.city, user?.district)}
        stats={[
          { label: 'Atölye', value: profile?.totalWorkshops ?? 0 },
          { label: 'Gönderi', value: stats?.postCount ?? 0 },
          { label: 'Takipçi', value: stats?.followerCount ?? 0 },
          { label: 'Takip', value: stats?.followingCount ?? 0 },
        ]}
        actions={{
          variant: 'own',
          onEditProfile: () => router.push('/(employer)/edit-profile' as any),
          onShareProfile: handleShare,
        }}
        extra={
          <>
            {profile?.workshopTitle ? (
              <View style={styles.workshopTitleRow}>
                <Icon name="briefcaseOutline" size={13} color="#6B7280" />
                <Text style={styles.workshopTitleText}>{profile.workshopTitle}</Text>
              </View>
            ) : null}
            {profile?.specialization && profile.specialization.length > 0 && (
              <View style={styles.specializationRow}>
                {profile.specialization.map((s, index) => (
                  <View key={`${s}-${index}`} style={styles.specChip}><Text style={styles.specChipText}>{s}</Text></View>
                ))}
              </View>
            )}
          </>
        }
      />

      <View style={styles.quickActionsRow}>
        <TouchableOpacity style={styles.newPostBtn} onPress={() => router.push('/(employer)/post/create' as any)}>
          <Icon name="add" size={16} color="#FFFFFF" />
          <Text style={styles.newPostBtnText}>Yeni Gönderi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Çıkış', 'Çıkış yapmak istiyor musun?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çıkış', style: 'destructive', onPress: handleLogout },
          ])}
        >
          <Icon name="logOutOutline" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'posts' && styles.tabActive]} onPress={() => setActiveTab('posts')}>
          <Icon name="gridOn" size={18} color={activeTab === 'posts' ? ACCENT : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>Gönderilerim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'info' && styles.tabActive]} onPress={() => setActiveTab('info')}>
          <Icon name="informationCircleOutline" size={18} color={activeTab === 'info' ? ACCENT : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>Bilgiler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInfo = () => (
    <View style={styles.infoSection}>
      <View style={styles.infoRow}>
        <Icon name="mailOutline" size={18} color="#6B7280" />
        <Text style={styles.infoText}>{user?.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="starOutline" size={18} color="#6B7280" />
        <Text style={styles.infoText}>{user?.xpPoints ?? 0} XP — Seviye {user?.rankLevel ?? 1}</Text>
      </View>
      {/* YENİ: deneyim yılı */}
      {profile?.yearsExperience != null && (
        <View style={styles.infoRow}>
          <Icon name="timeOutline" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{profile.yearsExperience} yıl deneyim</Text>
        </View>
      )}
      {formatCityDistrict(user?.city, user?.district) ? (
        <View style={styles.infoRow}>
          <Icon name="locationOutline" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{formatCityDistrict(user?.city, user?.district)}</Text>
        </View>
      ) : null}
      {/* YENİ: kategoriler */}
      {profile?.categoryNames && profile.categoryNames.length > 0 && (
        <View style={styles.infoRow}>
          <Icon name="pricetagsOutline" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{profile.categoryNames.join(', ')}</Text>
        </View>
      )}
      {/* DÜZELTİLDİ: banner kaldırıldı — buton artık header'da + ikonu */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {activeTab === 'posts' ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MyPostCard post={item} onEdit={handleEdit} onDelete={handleDelete} />}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            !loadingPosts ? (
              <View style={styles.empty}>
                <Icon name="newspaperOutline" size={44} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Henüz gönderi yok</Text>
                <TouchableOpacity style={styles.createPostBtn} onPress={() => router.push('/(employer)/post/create' as any)}>
                  <Text style={styles.createPostBtnText}>İlk gönderini paylaş</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          ListFooterComponent={
            loadingPosts ? <ActivityIndicator color={ACCENT} style={{ marginVertical: 24 }} />
            : loadingMore ? <ActivityIndicator color={ACCENT} style={{ marginVertical: 16 }} />
            : null
          }
          onEndReached={() => { if (hasMore && !loadingMore && !loadingPosts) fetchPosts(); }}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderInfo()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  listContent: { paddingBottom: 32 },
  quickActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  newPostBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  newPostBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  logoutBtn: { padding: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8 },
  workshopTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  workshopTitleText: { fontSize: 13, color: '#6B7280' },
  specializationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  specChip: { backgroundColor: '#F0FDFA', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  specChipText: { fontSize: 12, color: ACCENT, fontWeight: '500' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: ACCENT },
  tabText: { fontSize: 13, fontWeight: '500', color: '#9CA3AF' },
  tabTextActive: { color: ACCENT, fontWeight: '600' },
  postCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginHorizontal: 8, marginTop: 8, borderRadius: 10, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  postCardBody: { flex: 1, gap: 6 },
  postCardActions: { gap: 10, marginLeft: 8, paddingTop: 2 },
  postActionBtn: { padding: 4 },
  postContent: { fontSize: 14, color: '#374151', lineHeight: 20 },
  workshopTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workshopTagText: { fontSize: 11, color: '#6B7280', flexShrink: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  postMediaRow: { flexDirection: 'row', gap: 6 },
  postMediaThumb: { width: 82, height: 82, borderRadius: 10, backgroundColor: '#E5E7EB' },
  tagChip: { backgroundColor: '#F0FDFA', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 11, color: ACCENT, fontWeight: '500' },
  postMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  postStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postStatText: { fontSize: 12, color: '#9CA3AF', marginRight: 6 },
  postTime: { fontSize: 11, color: '#9CA3AF' },
  infoSection: { padding: 16, gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10 },
  infoText: { fontSize: 14, color: '#374151' },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 48 },
  emptyTitle: { fontSize: 15, color: '#6B7280' },
  createPostBtn: { backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  createPostBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
