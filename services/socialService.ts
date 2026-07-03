import { apiClient } from './apiClient';
import type {
  LikeResponse,
  CreateCommentRequest,
  CommentResponse,
  CommentListResponse,
  FollowResponse,
  FollowListResponse,
  ShareResponse,
} from '../types/social.types';
import type {
  CommentListResponseDto,
  CommentResponseDto,
  FollowListResponseDto,
  FollowResponseDto,
  LikeResponseDto,
  ShareResponseDto,
} from '../types/social.api';
import {
  mapCommentListResponse,
  mapCommentResponse,
  mapFollowListResponse,
  mapFollowResponse,
  mapLikeResponse,
  mapShareResponse,
} from './mappers/socialMapper';

export const socialService = {
  // ─── Like ──────────────────────────────────────────────────────────────────
  toggleLike: async (postId: string): Promise<LikeResponse> => {
    const { data } = await apiClient.post<LikeResponseDto>(`/posts/${postId}/like`);
    return mapLikeResponse(data);
  },

  // ─── Comment ───────────────────────────────────────────────────────────────
  createComment: async (
    postId: string,
    body: CreateCommentRequest
  ): Promise<CommentResponse> => {
    const { data } = await apiClient.post<CommentResponseDto>(
      `/posts/${postId}/comments`,
      body
    );
    return mapCommentResponse(data);
  },

  getComments: async (
    postId: string,
    cursor?: string,
    limit = 20
  ): Promise<CommentListResponse> => {
    const { data } = await apiClient.get<CommentListResponseDto>(
      `/posts/${postId}/comments`,
      { params: { ...(cursor ? { cursor } : {}), limit } }
    );
    return mapCommentListResponse(data);
  },

  // Backend: DELETE /api/v1/comments/{commentId} — postId YOK
  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },

  // ─── Follow ────────────────────────────────────────────────────────────────
  toggleFollow: async (targetUserId: string): Promise<FollowResponse> => {
    const { data } = await apiClient.post<FollowResponseDto>(
      `/users/${targetUserId}/follow`
    );
    return mapFollowResponse(data);
  },

  getFollowers: async (
    userId: string,
    cursor?: string,
    limit = 20
  ): Promise<FollowListResponse> => {
    const { data } = await apiClient.get<FollowListResponseDto>(
      `/users/${userId}/followers`,
      { params: { ...(cursor ? { cursor } : {}), limit } }
    );
    return mapFollowListResponse(data);
  },

  getFollowing: async (
    userId: string,
    cursor?: string,
    limit = 20
  ): Promise<FollowListResponse> => {
    const { data } = await apiClient.get<FollowListResponseDto>(
      `/users/${userId}/following`,
      { params: { ...(cursor ? { cursor } : {}), limit } }
    );
    return mapFollowListResponse(data);
  },

  // ─── Share ─────────────────────────────────────────────────────────────────
  getOrCreateShare: async (postId: string): Promise<ShareResponse> => {
    const { data } = await apiClient.get<ShareResponseDto>(`/posts/${postId}/share`);
    return mapShareResponse(data);
  },
};