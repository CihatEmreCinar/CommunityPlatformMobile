import { apiClient } from './apiClient';
import type { FeedResponse, FeedParams } from '../types/feed.types';

export const feedService = {
  // GET /feed — takip edilenlerin postları
  getFeed: async (params: FeedParams = {}): Promise<FeedResponse> => {
    const { cursor, limit = 20, tags, workshopId } = params;
    const { data } = await apiClient.get<FeedResponse>('/feed', {
      params: {
        ...(cursor ? { cursor } : {}),
        limit,
        ...(tags && tags.length > 0 ? { tags } : {}),
        ...(workshopId ? { workshopId } : {}),
      },
    });
    return data;
  },

  // GET /feed/explore — herkese açık feed
  getExploreFeed: async (params: FeedParams = {}): Promise<FeedResponse> => {
    const { cursor, limit = 20, tags, workshopId } = params;
    const { data } = await apiClient.get<FeedResponse>('/feed/explore', {
      params: {
        ...(cursor ? { cursor } : {}),
        limit,
        ...(tags && tags.length > 0 ? { tags } : {}),
        ...(workshopId ? { workshopId } : {}),
      },
    });
    return data;
  },
};