// ─── Feed Media ──────────────────────────────────────────────────────────────

export interface FeedPostMedia {
  id: string;
  mediaType: 'Image' | 'Video';
  url: string;
  orderIndex: number;
  widthPx: number | null;
  heightPx: number | null;
}

// ─── Feed Post ───────────────────────────────────────────────────────────────

export interface FeedPost {
  id: string;
  employerId: string;
  employerName: string;
  employerAvatarUrl: string | null;
  workshopId: string;
  workshopTitle: string;
  caption: string;           // backend: Caption
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  engagementScore: number;
  isLikedByMe: boolean;
  isFollowingEmployer: boolean;
  media: FeedPostMedia[];
  tags: string[];
  publishedAt: string | null;
}

// ─── Feed Response ───────────────────────────────────────────────────────────

export interface FeedResponse {
  posts: FeedPost[];
  hasNextPage: boolean;
  nextCursor: string | null;
}

// ─── Feed Params ─────────────────────────────────────────────────────────────

export interface FeedParams {
  cursor?: string | null;
  limit?: number;
  tags?: string[];
  workshopId?: string;
}