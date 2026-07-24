import React, { useCallback, useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../ui/EmptyState';
import { useFeed } from '../../hooks/useFeed';
import { useShare } from '../../hooks/useSocial';
import { useAuth } from '../../contexts/AuthContext';
import { FeedHeader } from './FeedHeader';
import { PostCard } from './PostCard';
import { CommentsModal } from './CommentModal';
import { resolveAuthorRoute, isOwnPost } from './FeedRouteResolver';
import { FEED_ACCENT_COLOR, type FeedConfiguration } from './FeedConfiguration';
import { Colors, Spacing } from '../../constants/theme';
import { useFloatingTabBarClearance } from '../layout/FloatingTabBar';
import type { FeedPost } from '../../types/feed.types';

export type FeedScreenProps = {
  config: FeedConfiguration;
};

export function FeedScreen({ config }: FeedScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const tabBarClearance = useFloatingTabBarClearance();
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
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error && posts.length === 0) {
    return (
      <EmptyState
        icon="cloudOfflineOutline"
        iconSize={48}
        description={error}
        actionLabel="Tekrar dene"
        onAction={refresh}
        style={styles.centered}
      />
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
            <EmptyState
              icon="newspaperOutline"
              iconSize={52}
              title="Feed boş"
              description="İlk paylaşımı sen yap."
              style={styles.empty}
            />
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.listFooter}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />}
        contentContainerStyle={posts.length === 0 ? styles.flatListEmpty : [styles.flatListContent, { paddingBottom: tabBarClearance }]}
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
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  flatListContent: { paddingVertical: Spacing.sm, gap: Spacing.sm },
  flatListEmpty: { flexGrow: 1 },
  listFooter: { paddingVertical: Spacing.md, alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingTop: 80, paddingHorizontal: Spacing.xl },
});
