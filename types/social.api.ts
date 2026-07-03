export interface LikeResponseDto {
  isLiked: boolean;
  likeCount: number;
}

export interface CommentResponseDto {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  parentCommentId: string | null;
  likeCount: number;
  replies: CommentResponseDto[];
  createdAt: string;
}

export interface CommentListResponseDto {
  comments: CommentResponseDto[];
  hasNextPage: boolean;
  nextCursor: string | null;
}

export interface FollowResponseDto {
  isFollowing: boolean;
  followerCount: number;
}

export interface FollowUserDto {
  userId: string;
  name: string;
  avatarUrl: string | null;
  isFollowingBack: boolean;
}

export interface FollowListResponseDto {
  users: FollowUserDto[];
  hasNextPage: boolean;
  nextCursor: string | null;
}

export interface ShareResponseDto {
  shareToken: string;
  shareUrl: string;
}