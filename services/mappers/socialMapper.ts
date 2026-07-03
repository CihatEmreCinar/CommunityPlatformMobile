import type {
  CommentListResponse,
  CommentResponse,
  FollowListResponse,
  FollowResponse,
  FollowUser,
  LikeResponse,
  ShareResponse,
} from '../../types/social.types';
import type {
  CommentListResponseDto,
  CommentResponseDto,
  FollowListResponseDto,
  FollowResponseDto,
  FollowUserDto,
  LikeResponseDto,
  ShareResponseDto,
} from '../../types/social.api';

export function mapLikeResponse(dto: LikeResponseDto): LikeResponse {
  return {
    liked: dto.isLiked,
    likeCount: dto.likeCount,
  };
}

export function mapCommentResponse(dto: CommentResponseDto): CommentResponse {
  return {
    id: dto.id,
    postId: dto.postId,
    authorId: dto.authorId,
    authorName: dto.authorName,
    authorAvatarUrl: dto.authorAvatarUrl,
    content: dto.content,
    parentCommentId: dto.parentCommentId,
    likeCount: dto.likeCount,
    replies: dto.replies.map(mapCommentResponse),
    createdAt: dto.createdAt,
  };
}

export function mapCommentListResponse(dto: CommentListResponseDto): CommentListResponse {
  return {
    comments: dto.comments.map(mapCommentResponse),
    hasNextPage: dto.hasNextPage,
    nextCursor: dto.nextCursor,
  };
}

export function mapFollowResponse(dto: FollowResponseDto): FollowResponse {
  return {
    following: dto.isFollowing,
    followerCount: dto.followerCount,
  };
}

function mapFollowUser(dto: FollowUserDto): FollowUser {
  return {
    userId: dto.userId,
    name: dto.name,
    avatarUrl: dto.avatarUrl,
    isFollowingBack: dto.isFollowingBack,
  };
}

export function mapFollowListResponse(dto: FollowListResponseDto): FollowListResponse {
  return {
    users: dto.users.map(mapFollowUser),
    hasNextPage: dto.hasNextPage,
    nextCursor: dto.nextCursor,
  };
}

export function mapShareResponse(dto: ShareResponseDto): ShareResponse {
  return {
    shareToken: dto.shareToken,
    shareUrl: dto.shareUrl,
  };
}