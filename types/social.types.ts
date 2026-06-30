// ─── Like ────────────────────────────────────────────────────────────────────

export interface LikeResponse {
  postId: string;
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
  createdAt: string;
}

export interface CommentListResponse {
  comments: CommentResponse[];   // backend: Comments (data değil)
  hasNextPage: boolean;
  nextCursor: string | null;
}

// ─── Follow ──────────────────────────────────────────────────────────────────

export interface FollowResponse {
  targetUserId: string;
  following: boolean;
  followerCount: number;
}

export interface FollowUser {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
}

export interface FollowListResponse {
  users: FollowUser[];           // backend: Users (data değil)
  hasNextPage: boolean;
  nextCursor: string | null;
}

// ─── Share ───────────────────────────────────────────────────────────────────

export interface ShareResponse {
  id: string;
  postId: string;
  shareUrl: string;
  shareCount: number;
}