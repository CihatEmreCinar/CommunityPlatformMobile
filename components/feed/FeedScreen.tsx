import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../ui/Icon';
import { useFeed } from '../../hooks/useFeed';
import { useShare } from '../../hooks/useSocial';
import { useAuth } from '../../contexts/AuthContext';
import { FeedHeader } from './FeedHeader';
import { PostCard } from './PostCard';
import { CommentsModal } from './CommentModal';
import { resolveAuthorRoute, isOwnPost } from './FeedRouteResolver';
import { FEED_ACCENT_COLOR, type FeedConfiguration } from './FeedConfiguration';
import type { FeedPost } from '../../types/feed.types';

export type FeedScreenProps = {
  config: FeedConfiguration;
};

export function FeedScreen({ config }: FeedScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  // Her rol kendi feed'inde herkesi görmeli → explore mode
  // (backend zaten authorType/Visibility'ye göre role uygun içeriği filtreliyor).
  const { posts, loading, loadingMore, refreshing, error, hasMore, refresh, loadMore, toggleLike } =
    useFeed(20, { mode: 'explore' });
  const { getShareUrl } = useShare();
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);

  const currentUserId = user?.id ?? null;

  useEffect(() => {
    refresh();
  }, []);

  const handleShare = useCallback(async (post: FeedPost) => {
    const url = await getShareUrl(post.id);
    await Share.share({ message: url ?? post.caption?.slice(0, 80) ?? 'Atolium paylaşımı', title: 'Atolium' });
  }, [getShareUrl]);

  const handleCreatePress = useCallback(() => {
    router.push(`/${config.routePrefix}/post/create` as any);
  }, [router, config.routePrefix]);

  const renderItem = useCallback(({ item }: { item: FeedPost }) => {
    const mine = isOwnPost(item, currentUserId);
    const authorRoute = resolveAuthorRoute(item, mine, config);
    return (
      <PostCard
        post={item}
        onLike={toggleLike}
        onComment={setCommentPost}
        onShare={handleShare}
        isMine={mine}
        onPressAuthor={authorRoute ? () => router.push(authorRoute as any) : undefined}
      />
    );
  }, [toggleLike, handleShare, currentUserId, config, router]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={FEED_ACCENT_COLOR} />
      </View>
    );
  }

  if (error && posts.length === 0) {
    return (
      <View style={styles.centered}>
        <Icon name="cloudOfflineOutline" size={48} color="#D1D5DB" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
          <Text style={styles.retryText}>Tekrar dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FeedHeader showCreateButton={config.canCreatePosts} onCreatePress={handleCreatePress} />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Icon name="newspaperOutline" size={52} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Feed boş</Text>
              <Text style={styles.emptyDesc}>İlk paylaşımı sen yap.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.listFooter}>
              <ActivityIndicator size="small" color={FEED_ACCENT_COLOR} />
            </View>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={FEED_ACCENT_COLOR} />}
        contentContainerStyle={posts.length === 0 ? styles.flatListEmpty : styles.flatListContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={10}
      />

      <CommentsModal visible={!!commentPost} post={commentPost} onClose={() => setCommentPost(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F3F4F6' },
  flatListContent: { paddingVertical: 8, gap: 8 },
  flatListEmpty: { flexGrow: 1 },
  listFooter: { paddingVertical: 16, alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 4 },
  emptyDesc: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  errorText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: FEED_ACCENT_COLOR, borderRadius: 8, marginTop: 4 },
  retryText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
