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
// NOT: Post artık Employer VEYA Cafe'ye ait olabilir (authorType/Visibility).
// Employer alanları (employerId/Name, workshopId/Title) Cafe post'larında yok;
// Cafe alanları (cafeId/Name/AvatarUrl) Employer post'larında yok.

export interface FeedPost {
  id: string;
  authorType: 'Employer' | 'Cafe';
  visibility: 'Public' | 'EmployersOnly';
  employerId?: string;
  employerName?: string;
  employerAvatarUrl: string | null;
  cafeId?: string;
  cafeName?: string;
  cafeAvatarUrl: string | null;
  workshopId?: string;
  workshopTitle?: string;
  caption: string | null;    // backend: Caption nullable
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