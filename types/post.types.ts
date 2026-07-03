// ─── Post Media ──────────────────────────────────────────────────────────────

export interface PostMediaItem {
  id: string;
  mediaType: 'Image' | 'Video';
  url: string;
  orderIndex: number;
  widthPx: number | null;
  heightPx: number | null;
}

// ─── Post (backend PostResponse ile eşleşiyor) ───────────────────────────────

export interface Post {
  id: string;
  employerId: string;
  employerName: string;
  employerAvatarUrl: string | null;
  workshopId: string;
  workshopTitle: string;
  caption: string | null;    // backend: Caption nullable
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  isLikedByMe: boolean;
  isFollowingEmployer: boolean;
  media: PostMediaItem[];
  tags: string[];            // slug listesi
  publishedAt: string | null;
}

// ─── Create / Update ─────────────────────────────────────────────────────────

export interface CreatePostRequest {
  workshopId: string;        // backend zorunlu
  caption: string | null;    // backend: Caption
  tagSlugs?: string[];       // backend: TagSlugs
}

export interface UpdatePostRequest {
  caption?: string;
  tagSlugs?: string[];
}

// ─── Post List ───────────────────────────────────────────────────────────────

export interface PostListResponse {
  posts: Post[];
  hasNextPage: boolean;
  nextCursor: string | null;
}

// ─── Social Stats ────────────────────────────────────────────────────────────

export interface UserSocialStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  isFollowedByMe: boolean;
}

// ─── Media Upload ────────────────────────────────────────────────────────────

export interface UploadMediaResponse {
  mediaId: string;
  uploadUrl: string;
  orderIndex: number;
}