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