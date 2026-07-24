import { useCallback, useEffect, useRef, useState } from 'react';
import { socialService } from '../services/socialService';
import { postService } from '../services/postService';
import { optimisticToggle } from '../utils/optimistic';
import type { Post, UserSocialStats } from '../types/post.types';

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

interface Options<TProfile> {
  userId: string;
  fetchProfile: (id: string) => Promise<TProfile>;
  /** Role özel ek paralel yüklemeler (ör. kafe değerlendirmeleri). İlk yüklemede ve refresh'te çalışır. */
  extraFetchers?: Array<() => Promise<unknown>>;
}

/**
 * Cafe/Employer herkese açık profil ekranlarının ortak durum makinesi:
 * profil + sosyal istatistik + gönderi listesi (cursor pagination) + takip/beğeni
 * (optimistic). Sadece profil verisinin nasıl çekileceği ve varsa role özel ek
 * yüklemeler parametre olarak verilir.
 */
export function usePublicProfile<TProfile>({ userId, fetchProfile, extraFetchers }: Options<TProfile>) {
  const [profile, setProfile] = useState<TProfile | null>(null);
  const [stats, setStats] = useState<UserSocialStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const cursorRef = useRef<string | null>(null);

  // Effect bağımlılığını sadece userId'de tutmak için fetch fonksiyonlarını ref'te taşıyoruz.
  const fetchProfileRef = useRef(fetchProfile);
  fetchProfileRef.current = fetchProfile;
  const extraRef = useRef(extraFetchers);
  extraRef.current = extraFetchers;

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setProfile(await fetchProfileRef.current(userId));
    } catch (error) {
      if (__DEV__) console.log('usePublicProfile: profil alınamadı', userId, error);
    } finally {
      setLoadingProfile(false);
    }
  }, [userId]);

  const loadStats = useCallback(async () => {
    if (!userId) return;
    try {
      setStats(await postService.getSocialStats(userId));
    } catch {
      // sessiz hata
    } finally {
      setLoadingStats(false);
    }
  }, [userId]);

  const runExtras = useCallback(() => Promise.all((extraRef.current ?? []).map((fn) => fn())), []);

  const loadPosts = useCallback(async (reset = false) => {
    if (!userId) return;
    const cursor = reset ? null : cursorRef.current;
    if (reset) setLoadingPosts(true);
    else setLoadingMore(true);
    try {
      const result = await postService.getUserPosts(userId, { cursor, limit: 15 });
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasNextPage);
      setPosts((prev) => (reset ? dedupePostsById(result.posts) : dedupePostsById([...prev, ...result.posts])));
    } catch {
      // sessiz hata
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  }, [userId]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) loadPosts(false);
  }, [hasMore, loadingMore, loadPosts]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    cursorRef.current = null;
    await Promise.all([loadProfile(), loadStats(), runExtras(), loadPosts(true)]);
    setRefreshing(false);
  }, [loadProfile, loadStats, runExtras, loadPosts]);

  useEffect(() => {
    loadProfile();
    loadStats();
    runExtras();
    loadPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleFollow = useCallback((): Promise<void> => {
    if (!userId) return Promise.resolve();
    const applyOptimistic = (prev: UserSocialStats | null): UserSocialStats | null => {
      if (!prev) return prev;
      const wasFollowing = prev.isFollowedByMe;
      return { ...prev, isFollowedByMe: !wasFollowing, followerCount: wasFollowing ? prev.followerCount - 1 : prev.followerCount + 1 };
    };
    return optimisticToggle({
      toggle: () => setStats(applyOptimistic),
      commit: async () => {
        setFollowLoading(true);
        try {
          return await socialService.toggleFollow(userId);
        } finally {
          setFollowLoading(false);
        }
      },
    });
  }, [userId]);

  const handleLike = useCallback((postId: string): Promise<void> => {
    const flip = (p: Post): Post => ({
      ...p,
      isLikedByMe: !p.isLikedByMe,
      likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1,
    });
    return optimisticToggle({
      toggle: () => setPosts((prev) => prev.map((p) => (p.id === postId ? flip(p) : p))),
      commit: () => socialService.toggleLike(postId),
      reconcile: (result) => setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isLikedByMe: result.liked, likeCount: result.likeCount } : p))),
    });
  }, []);

  return {
    profile,
    stats,
    posts,
    loadingProfile,
    loadingStats,
    loadingPosts,
    loadingMore,
    followLoading,
    hasMore,
    refreshing,
    loadMore,
    refresh,
    handleFollow,
    handleLike,
  };
}
