import { apiClient } from './apiClient';
import type {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PostListResponse,
  UserSocialStats,
  UploadMediaResponse,
} from '../types/post.types';
import type {
  PostDto,
  PostListDto,
  UploadMediaResponseDto,
  UserSocialStatsDto,
} from '../types/post.api';
import {
  mapPost,
  mapPostList,
  mapUploadMediaResponse,
  mapUserSocialStats,
} from './mappers/postMapper';

export const postService = {
  // ─── Post CRUD ─────────────────────────────────────────────────────────────

  create: async (body: CreatePostRequest): Promise<Post> => {
    const { data } = await apiClient.post<PostDto>('/posts', body);
    return mapPost(data);
  },

  getById: async (id: string): Promise<Post> => {
    const { data } = await apiClient.get<PostDto>(`/posts/${id}`);
    return mapPost(data);
  },

  update: async (id: string, body: UpdatePostRequest): Promise<Post> => {
    const { data } = await apiClient.patch<PostDto>(`/posts/${id}`, body);
    return mapPost(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },

  // ─── Media ───────────────────────────────────────────────────────── ────────

  uploadMedia: async (
    postId: string,
    file: FormData,
    orderIndex = 0
  ): Promise<UploadMediaResponse> => {
    const { data } = await apiClient.post<UploadMediaResponseDto>(
      `/posts/${postId}/media`,
      file,
      {
        params: { orderIndex },
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return mapUploadMediaResponse(data);
  },

  deleteMedia: async (postId: string, mediaId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/media/${mediaId}`);
  },

  // ─── Kullanıcı postları ────────────────────────────────────────────────────
  // NOT: Bu endpoint backend'de henüz yok — eklenince çalışır
  getUserPosts: async (
    userId: string,
    params: { cursor?: string | null; limit?: number } = {}
  ): Promise<PostListResponse> => {
    const { cursor, limit = 15 } = params;
    const { data } = await apiClient.get<PostListDto>(
      `/users/${userId}/posts`,
      {
        params: {
          ...(cursor ? { cursor } : {}),
          limit,
        },
      }
    );
    return mapPostList(data);
  },

  // ─── Sosyal istatistikler ──────────────────────────────────────────────────
  // NOT: Bu endpoint backend'de henüz yok — eklenince çalışır
  getSocialStats: async (userId: string): Promise<UserSocialStats> => {
    const { data } = await apiClient.get<UserSocialStatsDto>(
      `/users/${userId}/social-stats`
    );
    return mapUserSocialStats(data);
  },
};