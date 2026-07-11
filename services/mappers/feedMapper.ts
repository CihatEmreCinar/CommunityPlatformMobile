import type { FeedPost, FeedPostMedia, FeedResponse } from '../../types/feed.types';
import type { FeedPostDto, FeedPostMediaDto, FeedResponseDto } from '../../types/feed.api';
import { normalizeApiMediaUrl } from '../urlUtils';

function mapFeedPostMedia(dto: FeedPostMediaDto): FeedPostMedia | null {
  const normalizedUrl = normalizeApiMediaUrl(dto.url ?? dto.cdnUrl);
  if (!normalizedUrl) {
    return null;
  }

  return {
    id: dto.id,
    mediaType: dto.mediaType,
    url: normalizedUrl,
    orderIndex: dto.orderIndex,
    widthPx: dto.widthPx,
    heightPx: dto.heightPx,
  };
}

function mapFeedPost(dto: FeedPostDto): FeedPost {
  const mappedMedia = (dto.media ?? [])
    .map(mapFeedPostMedia)
    .filter((item): item is FeedPostMedia => item != null);

  return {
    id: dto.id,
    authorType: dto.authorType,
    visibility: dto.visibility,
    employerId: dto.employerId ?? undefined,
    employerName: dto.employerName ?? undefined,
    employerAvatarUrl: normalizeApiMediaUrl(dto.employerAvatarUrl),
    cafeId: dto.cafeId ?? undefined,
    cafeName: dto.cafeName ?? undefined,
    cafeAvatarUrl: normalizeApiMediaUrl(dto.cafeAvatarUrl),
    workshopId: dto.workshopId ?? undefined,
    workshopTitle: dto.workshopTitle ?? undefined,
    caption: dto.caption,
    likeCount: dto.likeCount,
    commentCount: dto.commentCount,
    shareCount: dto.shareCount,
    viewCount: dto.viewCount,
    engagementScore: dto.engagementScore,
    isLikedByMe: dto.isLikedByMe,
    isFollowingEmployer: dto.isFollowingEmployer,
    media: mappedMedia,
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