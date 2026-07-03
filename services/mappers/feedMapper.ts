import type { FeedPost, FeedPostMedia, FeedResponse } from '../../types/feed.types';
import type { FeedPostDto, FeedPostMediaDto, FeedResponseDto } from '../../types/feed.api';

function mapFeedPostMedia(dto: FeedPostMediaDto): FeedPostMedia {
  return {
    id: dto.id,
    mediaType: dto.mediaType,
    url: dto.url,
    orderIndex: dto.orderIndex,
    widthPx: dto.widthPx,
    heightPx: dto.heightPx,
  };
}

function mapFeedPost(dto: FeedPostDto): FeedPost {
  return {
    id: dto.id,
    employerId: dto.employerId,
    employerName: dto.employerName,
    employerAvatarUrl: dto.employerAvatarUrl,
    workshopId: dto.workshopId,
    workshopTitle: dto.workshopTitle,
    caption: dto.caption,
    likeCount: dto.likeCount,
    commentCount: dto.commentCount,
    shareCount: dto.shareCount,
    viewCount: dto.viewCount,
    engagementScore: dto.engagementScore,
    isLikedByMe: dto.isLikedByMe,
    isFollowingEmployer: dto.isFollowingEmployer,
    media: dto.media.map(mapFeedPostMedia),
    tags: dto.tags,
    publishedAt: dto.publishedAt,
  };
}

export function mapFeedResponse(dto: FeedResponseDto): FeedResponse {
  return {
    posts: dto.posts.map(mapFeedPost),
    hasNextPage: dto.hasNextPage,
    nextCursor: dto.nextCursor,
  };
}