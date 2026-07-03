import { apiClient } from './apiClient';
import type { FeedResponse, FeedParams } from '../types/feed.types';
import type { FeedResponseDto } from '../types/feed.api';
import { mapFeedResponse } from './mappers/feedMapper';

export const feedService = {
  // GET /feed — takip edilenlerin postları
  getFeed: async (params: FeedParams = {}): Promise<FeedResponse> => {
    const { cursor, limit = 20, tags, workshopId } = params;
    const { data } = await apiClient.get<FeedResponseDto>('/feed', {
      params: {
        ...(cursor ? { cursor } : {}),
        limit,
        ...(tags && tags.length > 0 ? { tags } : {}),
        ...(workshopId ? { workshopId } : {}),
      },
    });
    return mapFeedResponse(data);
  },

  // GET /feed/explore — herkese açık feed
  getExploreFeed: async (params: FeedParams = {}): Promise<FeedResponse> => {
    const { cursor, limit = 20, tags, workshopId } = params;
    const { data } = await apiClient.get<FeedResponseDto>('/feed/explore', {
      params: {
        ...(cursor ? { cursor } : {}),
        limit,
        ...(tags && tags.length > 0 ? { tags } : {}),
        ...(workshopId ? { workshopId } : {}),
      },
    });
    return mapFeedResponse(data);
  },
};