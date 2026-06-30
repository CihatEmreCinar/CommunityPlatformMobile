import { useState, useCallback, useRef } from 'react';
import { feedService } from '../services/feedService';
import { socialService } from '../services/socialService';
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

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<string | null>(null);

  const fetchFeed = useCallback(
    (cursor?: string | null) =>
      mode === 'following'
        ? feedService.getFeed({ cursor, limit })
        : feedService.getExploreFeed({ cursor, limit }),
    [mode, limit]
  );

  // ─── İlk yükleme / pull-to-refresh ────────────────────────────────────────
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchFeed(null);
      cursorRef.current = result.nextCursor;
      setPosts(result.posts);           // backend: posts (data değil)
      setHasMore(result.hasNextPage);   // backend: hasNextPage (hasMore değil)
    } catch {
      setError('Feed yüklenemedi.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchFeed]);

  // ─── Daha fazla yükle ─────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const result = await fetchFeed(cursorRef.current);
      cursorRef.current = result.nextCursor;
      setPosts((prev) => [...prev, ...result.posts]);
      setHasMore(result.hasNextPage);
    } catch {
      setError('Daha fazla yüklenemedi.');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, fetchFeed]);

  // ─── Optimistic like toggle ────────────────────────────────────────────────
  const toggleLike = useCallback(async (postId: string) => {
    // 1. Optimistic UI
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLikedByMe: !p.isLikedByMe,
              likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1,
            }
          : p
      )
    );
    try {
      // 2. Backend gerçek değer
      const result = await socialService.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLikedByMe: result.liked, likeCount: result.likeCount }
            : p
        )
      );
    } catch {
      // 3. Rollback
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLikedByMe: !p.isLikedByMe,
                likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1,
              }
            : p
        )
      );
    }
  }, []);

  return {
    posts,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
    toggleLike,
  };
}