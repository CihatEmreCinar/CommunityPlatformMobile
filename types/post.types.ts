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
// NOT: Post artık Employer VEYA Cafe'ye ait olabilir (authorType/Visibility).
// Employer alanları (employerId/Name, workshopId/Title) Cafe post'larında yok;
// Cafe alanları (cafeId/Name/AvatarUrl) Employer post'larında yok. Bu yüzden
// employer/workshop alanları optional.

export interface Post {
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
  isLikedByMe: boolean;
  isFollowingEmployer: boolean;
  media: PostMediaItem[];
  tags: string[];            // slug listesi
  publishedAt: string | null;
}

// ─── Create / Update ─────────────────────────────────────────────────────────

export interface CreatePostRequest {
  workshopId?: string;       // Cafe post'unda gönderilmez — backend artık nullable kabul ediyor
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