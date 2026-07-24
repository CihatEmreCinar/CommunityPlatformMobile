import { useCallback } from 'react';
import { feedService } from '../services/feedService';
import { socialService } from '../services/socialService';
import { usePaginatedResource } from './usePaginatedResource';
import { optimisticToggle } from '../utils/optimistic';
import type { FeedPost } from '../types/feed.types';

interface UseFeedOptions {
  mode?: 'following' | 'explore';
}

interface UseFeedReturn {
  posts: FeedPost[];
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
}

export function useFeed(limit = 20, options: UseFeedOptions = {}): UseFeedReturn {
  const { mode = 'explore' } = options;

  const fetchPage = useCallback(
    async (cursor: string | null) => {
      const result =
        mode === 'following'
          ? await feedService.getFeed({ cursor, limit })
          : await feedService.getExploreFeed({ cursor, limit });
      // backend: posts / nextCursor / hasNextPage (data/hasMore değil)
      return { items: result.posts, nextCursor: result.nextCursor, hasMore: result.hasNextPage };
    },
    [mode, limit]
  );

  const {
    items: posts,
    setItems: setPosts,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
  } = usePaginatedResource<FeedPost, string>({
    fetchPage,
    loadErrorMessage: 'Feed yüklenemedi.',
    loadMoreErrorMessage: 'Daha fazla yüklenemedi.',
    // FeedScreen ilk yüklemeyi kendi useEffect'inde refresh() ile tetikliyor.
    autoLoad: false,
  });

  // ─── Optimistic like toggle ────────────────────────────────────────────────
  const toggleLike = useCallback((postId: string) => {
    const flip = (p: FeedPost): FeedPost => ({
      ...p,
      isLikedByMe: !p.isLikedByMe,
      likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1,
    });
    return optimisticToggle({
      toggle: () => setPosts((prev) => prev.map((p) => (p.id === postId ? flip(p) : p))),
      commit: () => socialService.toggleLike(postId),
      reconcile: (result) => setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isLikedByMe: result.liked, likeCount: result.likeCount } : p))),
    });
  }, [setPosts]);

  return { posts, loading, loadingMore, refreshing, error, hasMore, refresh, loadMore, toggleLike };
}
