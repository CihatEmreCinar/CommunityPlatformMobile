export interface PostMediaItemDto {
  id: string;
  mediaType: 'Image' | 'Video';
  url: string;
  orderIndex: number;
  widthPx: number | null;
  heightPx: number | null;
}

export interface PostDto {
  id: string;
  employerId: string;
  employerName: string;
  employerAvatarUrl: string | null;
  workshopId: string;
  workshopTitle: string;
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