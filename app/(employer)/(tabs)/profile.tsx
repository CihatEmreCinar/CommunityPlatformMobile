import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, ScrollView, Image,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postService } from '../../../services/postService';
import { formatNotificationTime } from '../../../utils/notificationUtils';
import type { Post, UserSocialStats } from '../../../types/post.types';

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

// ─── Stat kutusu ─────────────────────────────────────────────────────────────

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
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
            <Ionicons name="briefcase-outline" size={11} color="#6B7280" />
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
            <Ionicons name="heart-outline" size={13} color="#9CA3AF" />
            <Text style={styles.postStatText}>{post.likeCount}</Text>
            <Ionicons name="chatbubble-outline" size={13} color="#9CA3AF" />
            <Text style={styles.postStatText}>{post.commentCount}</Text>
          </View>
          <Text style={styles.postTime}>{formatNotificationTime(post.publishedAt ?? '')}</Text>
        </View>
      </View>
      <View style={styles.postCardActions}>
        <TouchableOpacity onPress={() => onEdit(post.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.postActionBtn}>
          <Ionicons name="pencil-outline" size={18} color={ACCENT} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(post.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.postActionBtn}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
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
      <View style={styles.profileTop}>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => router.push('/(employer)/edit-profile' as any)}
          activeOpacity={0.7}
        >
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <Ionicons name="camera" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.profileActions}>
          {/* YENİ: Yeni gönderi paylaş — header'da sabit + ikonu */}
          <TouchableOpacity
            style={styles.newPostIconBtn}
            onPress={() => router.push('/(employer)/post/create' as any)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => router.push('/(employer)/edit-profile' as any)}
          >
            <Text style={styles.editProfileText}>Profili Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => Alert.alert('Çıkış', 'Çıkış yapmak istiyor musun?', [
              { text: 'İptal', style: 'cancel' },
              { text: 'Çıkış', style: 'destructive', onPress: handleLogout },
            ])}
          >
            <Ionicons name="log-out-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.nameSection}>
        <Text style={styles.fullName}>{user?.firstName} {user?.lastName}</Text>
        <View style={styles.roleBadge}><Text style={styles.roleText}>Eğitmen</Text></View>
      </View>

      {/* YENİ: workshopTitle (unvan) varsa göster */}
      {profile?.workshopTitle ? (
        <Text style={styles.workshopTitleText}>{profile.workshopTitle}</Text>
      ) : null}

      {/* YENİ: bio */}
      {user?.bio ? (
        <Text style={styles.bioText}>{user.bio}</Text>
      ) : null}

      {user?.city ? (
        <Text style={styles.cityText}>{user.city}</Text>
      ) : null}

      {/* YENİ: uzmanlık tag'leri */}
      {profile?.specialization && profile.specialization.length > 0 && (
        <View style={styles.specializationRow}>
          {profile.specialization.map((s, index) => (
            <View key={`${s}-${index}`} style={styles.specChip}><Text style={styles.specChipText}>{s}</Text></View>
          ))}
        </View>
      )}

      {loadingStats ? (
        <ActivityIndicator color={ACCENT} style={{ marginVertical: 16 }} />
      ) : (
        <View style={styles.statsRow}>
          <StatBox value={stats?.postCount ?? 0} label="Gönderi" />
          <View style={styles.statDivider} />
          <StatBox value={stats?.followerCount ?? 0} label="Takipçi" />
          <View style={styles.statDivider} />
          <StatBox value={stats?.followingCount ?? 0} label="Takip" />
        </View>
      )}

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'posts' && styles.tabActive]} onPress={() => setActiveTab('posts')}>
          <MaterialIcons name="grid-on" size={18} color={activeTab === 'posts' ? ACCENT : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>Gönderilerim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'info' && styles.tabActive]} onPress={() => setActiveTab('info')}>
          <Ionicons name="information-circle-outline" size={18} color={activeTab === 'info' ? ACCENT : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>Bilgiler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInfo = () => (
    <View style={styles.infoSection}>
      <View style={styles.infoRow}>
        <Ionicons name="mail-outline" size={18} color="#6B7280" />
        <Text style={styles.infoText}>{user?.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="star-outline" size={18} color="#6B7280" />
        <Text style={styles.infoText}>{user?.xpPoints ?? 0} XP — Seviye {user?.rankLevel ?? 1}</Text>
      </View>
      {/* YENİ: deneyim yılı */}
      {profile?.yearsExperience != null && (
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{profile.yearsExperience} yıl deneyim</Text>
        </View>
      )}
      {user?.city ? (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{user.city}</Text>
        </View>
      ) : null}
      {/* YENİ: kategoriler */}
      {profile?.categoryNames && profile.categoryNames.length > 0 && (
        <View style={styles.infoRow}>
          <Ionicons name="pricetags-outline" size={18} color="#6B7280" />
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
                <Ionicons name="newspaper-outline" size={44} color="#D1D5DB" />
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
  profileTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 16, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  avatarInitials: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  avatarEditBadge: { position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  profileActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  newPostIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  editProfileBtn: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  editProfileText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  logoutBtn: { padding: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8 },
  nameSection: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 4, backgroundColor: '#FFFFFF' },
  fullName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  roleBadge: { backgroundColor: '#F0FDFA', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  roleText: { fontSize: 11, fontWeight: '600', color: ACCENT },
  workshopTitleText: { fontSize: 13, color: '#6B7280', paddingHorizontal: 16, paddingBottom: 6, backgroundColor: '#FFFFFF' },
  bioText: { fontSize: 13, color: '#374151', lineHeight: 19, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  cityText: { fontSize: 13, color: '#6B7280', fontWeight: '600', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  specializationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  specChip: { backgroundColor: '#F0FDFA', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  specChipText: { fontSize: 12, color: ACCENT, fontWeight: '500' },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statDivider: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: '#E5E7EB' },
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
