// ─── Like ────────────────────────────────────────────────────────────────────

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

// ─── Comment ─────────────────────────────────────────────────────────────────

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string | null;
}

export interface CommentResponse {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  parentCommentId: string | null;
  likeCount: number;
  replies: CommentResponse[];
  createdAt: string;
}

export interface CommentListResponse {
  comments: CommentResponse[];   // backend: Comments (data değil)
  hasNextPage: boolean;
  nextCursor: string | null;
}

// ─── Follow ──────────────────────────────────────────────────────────────────

export interface FollowResponse {
  following: boolean;
  followerCount: number;
}

export interface FollowUser {
  userId: string;
  name: string;
  avatarUrl: string | null;
  isFollowingBack: boolean;
}

export interface FollowListResponse {
  users: FollowUser[];           // backend: Users (data değil)
  hasNextPage: boolean;
  nextCursor: string | null;
}

// ─── Share ───────────────────────────────────────────────────────────────────

export interface ShareResponse {
  shareToken: string;
  shareUrl: string;
}