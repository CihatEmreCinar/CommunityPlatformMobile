import { apiClient } from './apiClient';
import type {
  NotificationListResult,
  NotificationListParams,
  UnreadCountResult,
  MarkReadResponse,
  MarkAllReadResponse,
} from '../types/notification.types';
import type {
  NotificationListDto,
  UnreadCountDto,
  MarkReadDto,
  MarkAllReadDto,
} from '../types/notification.api';
import { mapNotificationList } from './mappers/notificationMapper';

const BASE = '/notifications';

export const notificationService = {
  /**
   * GET /api/v1/notifications?page=1&limit=20
   */
  getAll: async (params: NotificationListParams = {}): Promise<NotificationListResult> => {
    const { page = 1, limit = 20 } = params;
    const { data } = await apiClient.get<NotificationListDto>(BASE, {
      params: { page, limit },
    });
    return mapNotificationList(data, page, limit);
  },

  /**
   * GET /api/v1/notifications/unread-count
   */
  getUnreadCount: async (): Promise<UnreadCountResult> => {
    const { data } = await apiClient.get<UnreadCountDto>(`${BASE}/unread-count`);
    return data;
  },

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  markRead: async (id: string): Promise<MarkReadResponse> => {
    const { data } = await apiClient.patch<MarkReadDto>(`${BASE}/${id}/read`);
    return data;
  },

  /**
   * PATCH /api/v1/notifications/read-all
   */
  markAllRead: async (): Promise<MarkAllReadResponse> => {
    const { data } = await apiClient.patch<MarkAllReadDto>(`${BASE}/read-all`);
    return data;
  },

  /**
   * DELETE /api/v1/notifications/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};