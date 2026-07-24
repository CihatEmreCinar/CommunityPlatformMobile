import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Share } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../ui/Icon';
import { IconCircleButton } from '../ui/IconCircleButton';
import { formatNotificationTime } from '../../utils/notificationUtils';
import type { Post } from '../../types/post.types';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';

const ACCENT = Colors.primary;
const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

/** Kart/etiket zeminlerini boyayan pastel palet (Pastel.coral | Pastel.teal). */
type PastelPalette = typeof Pastel.teal;

function PostCard({ post, accent, onLike }: { post: Post; accent: PastelPalette; onLike: (id: string) => void }) {
  return (
    <View style={[styles.postCard, { backgroundColor: accent.tint }]}>
      <Text style={styles.postContent} numberOfLines={4}>{post.caption}</Text>
      {post.media && post.media.length > 0 ? (
        <View style={styles.postMediaRow}>
          {post.media.slice(0, 3).map((m) => (
            <Image key={m.id} source={{ uri: m.url }} style={styles.postMediaThumb} contentFit="cover" />
          ))}
        </View>
      ) : null}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagRow}>
          {post.tags.map((t) => (
            <View key={t} style={[styles.tagChip, { backgroundColor: accent.tintStrong }]}>
              <Text style={[styles.tagText, { color: accent.text }]}>#{t}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.postMeta}>
        <TouchableOpacity style={styles.postAction} onPress={() => onLike(post.id)}>
          <Icon name={post.isLikedByMe ? 'heartFilled' : 'heartOutline'} size={15} color={post.isLikedByMe ? Colors.like : Colors.outline} />
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

export interface PublicProfileLayoutProps {
  /** Kart/etiket zeminleri için pastel palet. */
  accent: PastelPalette;
  /** Paylaş butonunun mesajı. */
  shareMessage: string;
  /** topBar ile "Gönderiler" başlığı arasında render edilen role özel içerik (ProfileHeader vb.). */
  header: React.ReactNode;
  posts: Post[];
  loadingProfile: boolean;
  loadingPosts: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onLike: (id: string) => void;
}

/**
 * Cafe/Employer herkese açık profil ekranlarının ortak yerleşimi: geri/paylaş içeren
 * top bar, gönderi FlatList'i, gönderi kartı, boş/yükleniyor durumları. Role özel
 * başlık içeriği `header` prop'u ile, veri/işlevler ise usePublicProfile'dan gelir.
 */
export function PublicProfileLayout({
  accent,
  shareMessage,
  header,
  posts,
  loadingProfile,
  loadingPosts,
  loadingMore,
  refreshing,
  onRefresh,
  onLoadMore,
  onLike,
}: PublicProfileLayoutProps) {
  const router = useRouter();

  const renderHeader = () => (
    <View>
      <View style={styles.topBar}>
        <IconCircleButton icon="arrowBackAlt" iconSize={20} onPress={() => router.back()} accessibilityLabel="Geri" hitSlop={HIT_SLOP} />
        <IconCircleButton icon="shareSocialOutline" onPress={() => Share.share({ message: shareMessage })} accessibilityLabel="Paylaş" hitSlop={HIT_SLOP} />
      </View>

      {header}

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
        renderItem={({ item }) => <PostCard post={item} accent={accent} onLike={onLike} />}
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
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
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
  postsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: Spacing.md, marginTop: Spacing.sm },
  postsSectionTitle: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  postCard: { marginHorizontal: Spacing.sm, marginTop: Spacing.sm, borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.sm },
  postContent: { ...Typography.bodyMd, color: Colors.onSurface, lineHeight: 20 },
  postMediaRow: { flexDirection: 'row', gap: 6 },
  postMediaThumb: { width: 88, height: 88, borderRadius: Radius.lg, backgroundColor: Colors.surfaceContainer },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: { borderRadius: Radius.md, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { ...Typography.labelSm, fontWeight: '600' },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  postTime: { marginLeft: 'auto', ...Typography.labelSm, color: Colors.outline },
  empty: { alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingTop: 48 },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
});
