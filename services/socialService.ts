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

export const socialService = {
  // ─── Like ──────────────────────────────────────────────────────────────────
  toggleLike: async (postId: string): Promise<LikeResponse> => {
    const { data } = await apiClient.post<LikeResponse>(`/posts/${postId}/like`);
    return data;
  },

  // ─── Comment ───────────────────────────────────────────────────────────────
  createComment: async (
    postId: string,
    body: CreateCommentRequest
  ): Promise<CommentResponse> => {
    const { data } = await apiClient.post<CommentResponse>(
      `/posts/${postId}/comments`,
      body
    );
    return data;
  },

  getComments: async (
    postId: string,
    cursor?: string,
    limit = 20
  ): Promise<CommentListResponse> => {
    const { data } = await apiClient.get<CommentListResponse>(
      `/posts/${postId}/comments`,
      { params: { ...(cursor ? { cursor } : {}), limit } }
    );
    return data;
  },

  // Backend: DELETE /api/v1/comments/{commentId} — postId YOK
  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },

  // ─── Follow ────────────────────────────────────────────────────────────────
  toggleFollow: async (targetUserId: string): Promise<FollowResponse> => {
    const { data } = await apiClient.post<FollowResponse>(
      `/users/${targetUserId}/follow`
    );
    return data;
  },

  getFollowers: async (
    userId: string,
    cursor?: string,
    limit = 20
  ): Promise<FollowListResponse> => {
    const { data } = await apiClient.get<FollowListResponse>(
      `/users/${userId}/followers`,
      { params: { ...(cursor ? { cursor } : {}), limit } }
    );
    return data;
  },

  getFollowing: async (
    userId: string,
    cursor?: string,
    limit = 20
  ): Promise<FollowListResponse> => {
    const { data } = await apiClient.get<FollowListResponse>(
      `/users/${userId}/following`,
      { params: { ...(cursor ? { cursor } : {}), limit } }
    );
    return data;
  },

  // ─── Share ─────────────────────────────────────────────────────────────────
  getOrCreateShare: async (postId: string): Promise<ShareResponse> => {
    const { data } = await apiClient.get<ShareResponse>(`/posts/${postId}/share`);
    return data;
  },
};