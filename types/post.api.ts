export interface PostMediaItemDto {
  id: string;
  mediaType: 'Image' | 'Video';
  url?: string | null;
  cdnUrl?: string | null;
  orderIndex: number;
  widthPx: number | null;
  heightPx: number | null;
}

export interface PostDto {
  id: string;
  authorType: 'Employer' | 'Cafe';
  visibility: 'Public' | 'EmployersOnly';
  employerId?: string | null;
  employerName?: string | null;
  employerAvatarUrl?: string | null;
  cafeId?: string | null;
  cafeName?: string | null;
  cafeAvatarUrl?: string | null;
  workshopId?: string | null;
  workshopTitle?: string | null;
  caption: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  isLikedByMe: boolean;
  isFollowingEmployer: boolean;
  media: PostMediaItemDto[];
  tags: string[];
  publishedAt: string | null;
}

export interface PostListDto {
  posts: PostDto[];
  hasNextPage: boolean;
  nextCursor: string | null;
}

export interface UserSocialStatsDto {
  postCount: number;
  followerCount: number;
  followingCount: number;
  isFollowedByMe: boolean;
}

export interface UploadMediaResponseDto {
  mediaId: string;
  uploadUrl: string;
  orderIndex: number;
}