export interface FeedPostMediaDto {
  id: string;
  mediaType: 'Image' | 'Video';
  url?: string | null;
  cdnUrl?: string | null;
  orderIndex: number;
  widthPx: number | null;
  heightPx: number | null;
}

export interface FeedPostDto {
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
  engagementScore: number;
  isLikedByMe: boolean;
  isFollowingEmployer: boolean;
  media: FeedPostMediaDto[];
  tags: string[];
  publishedAt: string | null;
}

export interface FeedResponseDto {
  posts: FeedPostDto[];
  hasNextPage: boolean;
  nextCursor: string | null;
}