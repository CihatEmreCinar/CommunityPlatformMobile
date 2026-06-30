import { apiClient } from './apiClient';
import type {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PostListResponse,
  UserSocialStats,
  UploadMediaResponse,
} from '../types/post.types';

export const postService = {
  // ─── Post CRUD ─────────────────────────────────────────────────────────────

  create: async (body: CreatePostRequest): Promise<Post> => {
    const { data } = await apiClient.post<Post>('/posts', body);
    return data;
  },

  getById: async (id: string): Promise<Post> => {
    const { data } = await apiClient.get<Post>(`/posts/${id}`);
    return data;
  },

  update: async (id: string, body: UpdatePostRequest): Promise<Post> => {
    const { data } = await apiClient.patch<Post>(`/posts/${id}`, body);
    return data;
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
    const { data } = await apiClient.post<UploadMediaResponse>(
      `/posts/${postId}/media`,
      file,
      {
        params: { orderIndex },
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data;
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
    const { data } = await apiClient.get<PostListResponse>(
      `/users/${userId}/posts`,
      {
        params: {
          ...(cursor ? { cursor } : {}),
          limit,
        },
      }
    );
    return data;
  },

  // ─── Sosyal istatistikler ──────────────────────────────────────────────────
  // NOT: Bu endpoint backend'de henüz yok — eklenince çalışır
  getSocialStats: async (userId: string): Promise<UserSocialStats> => {
    const { data } = await apiClient.get<UserSocialStats>(
      `/users/${userId}/social-stats`
    );
    return data;
  },
};