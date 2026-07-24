import { useState, useCallback, useRef } from 'react';
import { socialService } from '../services/socialService';
import { optimisticToggle } from '../utils/optimistic';
import type {
  CommentResponse,
  CreateCommentRequest,
  FollowUser,
} from '../types/social.types';

// ─── useComments ─────────────────────────────────────────────────────────────

interface UseCommentsReturn {
  comments: CommentResponse[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, body: CreateCommentRequest) => Promise<void>;
  removeComment: (commentId: string) => Promise<void>; // postId yok — backend: /comments/{id}
}

export function useComments(): UseCommentsReturn {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await socialService.getComments(postId);
      setComments(result.comments); // backend: comments (data değil)
    } catch {
      setError('Yorumlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(
    async (postId: string, body: CreateCommentRequest) => {
      setSubmitting(true);
      try {
        const newComment = await socialService.createComment(postId, body);
        setComments((prev) => [newComment, ...prev]);
      } catch {
        setError('Yorum gönderilemedi.');
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const removeComment = useCallback(async (commentId: string) => {
    // Optimistic kaldır
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await socialService.deleteComment(commentId); // artık sadece commentId
    } catch {
      setError('Yorum silinemedi.');
    }
  }, []);

  return { comments, loading, submitting, error, fetchComments, addComment, removeComment };
}

// ─── useFollow ───────────────────────────────────────────────────────────────

interface FollowState {
  following: boolean;
  followerCount: number;
}

interface UseFollowReturn {
  followState: FollowState | null;
  followers: FollowUser[];
  following: FollowUser[];
  loadingFollow: boolean;
  loadingList: boolean;
  toggleFollow: (targetUserId: string) => Promise<void>;
  fetchFollowers: (userId: string) => Promise<void>;
  fetchFollowing: (userId: string) => Promise<void>;
}

export function useFollow(initialState?: FollowState): UseFollowReturn {
  const [followState, setFollowState] = useState<FollowState | null>(
    initialState ?? null
  );
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // followState'i ref'te tutuyoruz ki toggleFollow stabil kalsın (stale closure yok).
  const followStateRef = useRef(followState);
  followStateRef.current = followState;

  const toggleFollow = useCallback((targetUserId: string) => {
    if (!followStateRef.current) return Promise.resolve();
    return optimisticToggle({
      toggle: () =>
        setFollowState((s) =>
          s ? { following: !s.following, followerCount: s.following ? s.followerCount - 1 : s.followerCount + 1 } : s
        ),
      commit: async () => {
        setLoadingFollow(true);
        try {
          return await socialService.toggleFollow(targetUserId);
        } finally {
          setLoadingFollow(false);
        }
      },
      reconcile: (result) => setFollowState({ following: result.following, followerCount: result.followerCount }),
    });
  }, []);

  const fetchFollowers = useCallback(async (userId: string) => {
    setLoadingList(true);
    try {
      const result = await socialService.getFollowers(userId);
      setFollowers(result.users); // backend: users (data değil)
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchFollowing = useCallback(async (userId: string) => {
    setLoadingList(true);
    try {
      const result = await socialService.getFollowing(userId);
      setFollowing(result.users); // backend: users (data değil)
    } finally {
      setLoadingList(false);
    }
  }, []);

  return {
    followState,
    followers,
    following,
    loadingFollow,
    loadingList,
    toggleFollow,
    fetchFollowers,
    fetchFollowing,
  };
}

// ─── useShare ────────────────────────────────────────────────────────────────

interface UseShareReturn {
  sharing: boolean;
  getShareUrl: (postId: string) => Promise<string | null>;
}

export function useShare(): UseShareReturn {
  const [sharing, setSharing] = useState(false);

  const getShareUrl = useCallback(async (postId: string): Promise<string | null> => {
    setSharing(true);
    try {
      const result = await socialService.getOrCreateShare(postId);
      return result.shareUrl;
    } catch {
      return null;
    } finally {
      setSharing(false);
    }
  }, []);

  return { sharing, getShareUrl };
}