import type {
  Post,
  PostListResponse,
  PostMediaItem,
  UploadMediaResponse,
  UserSocialStats,
} from '../../types/post.types';
import type {
  PostDto,
  PostListDto,
  PostMediaItemDto,
  UploadMediaResponseDto,
  UserSocialStatsDto,
} from '../../types/post.api';
import { normalizeApiMediaUrl, debugLogMediaUrl } from '../urlUtils';

function mapPostMediaItem(dto: PostMediaItemDto): PostMediaItem | null {
  if (__DEV__) {
    debugLogMediaUrl(`media[${dto.id}] url/cdnUrl`, dto.url ?? dto.cdnUrl);
  }
  const normalizedUrl = normalizeApiMediaUrl(dto.url ?? dto.cdnUrl);
  if (!normalizedUrl) {
    if (__DEV__) console.warn('[POST_MEDIA] Skipping unrenderable media item id=', dto.id, 'raw=', dto.url ?? dto.cdnUrl);
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

export function mapPost(dto: PostDto): Post {
  const mappedMedia = (dto.media ?? [])
    .map(mapPostMediaItem)
    .filter((item): item is PostMediaItem => item != null);

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
    isLikedByMe: dto.isLikedByMe,
    isFollowingEmployer: dto.isFollowingEmployer,
    media: mappedMedia,
    tags: dto.tags,
    publishedAt: dto.publishedAt,
  };
}

export function mapPostList(dto: PostListDto): PostListResponse {
  return {
    posts: dto.posts.map(mapPost),
    hasNextPage: dto.hasNextPage,
    nextCursor: dto.nextCursor,
  };
}

export function mapUserSocialStats(dto: UserSocialStatsDto): UserSocialStats {
  return {
    postCount: dto.postCount,
    followerCount: dto.followerCount,
    followingCount: dto.followingCount,
    isFollowedByMe: dto.isFollowedByMe,
  };
}

export function mapUploadMediaResponse(dto: UploadMediaResponseDto): UploadMediaResponse {
  return {
    mediaId: dto.mediaId,
    uploadUrl: dto.uploadUrl,
    orderIndex: dto.orderIndex,
  };
}