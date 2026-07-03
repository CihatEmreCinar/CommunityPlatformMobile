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

function mapPostMediaItem(dto: PostMediaItemDto): PostMediaItem {
  return {
    id: dto.id,
    mediaType: dto.mediaType,
    url: dto.url,
    orderIndex: dto.orderIndex,
    widthPx: dto.widthPx,
    heightPx: dto.heightPx,
  };
}

export function mapPost(dto: PostDto): Post {
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
    isLikedByMe: dto.isLikedByMe,
    isFollowingEmployer: dto.isFollowingEmployer,
    media: dto.media.map(mapPostMediaItem),
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