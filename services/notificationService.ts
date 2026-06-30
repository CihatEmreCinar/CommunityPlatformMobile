import { apiClient } from './apiClient';
import type {
  Notification,
  NotificationListParams,
  UnreadCountResponse,
  MarkReadResponse,
  MarkAllReadResponse,
} from '../types/notification.types';

const BASE = '/notifications';

// Backend'in dönebileceği iki farklı response formatını handle et:
// Format A: doğrudan Notification[]
// Format B: { data: Notification[], total: number, page: number }
function extractList(raw: any): Notification[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  if (raw && Array.isArray(raw.items)) return raw.items;
  return [];
}

export const notificationService = {
  /**
   * GET /api/v1/notifications?page=1&limit=20
   */
  getAll: async (params: NotificationListParams = {}): Promise<Notification[]> => {
    const { page = 1, limit = 20 } = params;
    const { data } = await apiClient.get(BASE, {
      params: { page, limit },
    });
    return extractList(data);
  },

  /**
   * GET /api/v1/notifications/unread-count
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
  const { data } = await apiClient.get(`${BASE}/unread-count`);

  // backend direkt number dönerse
  if (typeof data === 'number') {
    return { unreadCount: data };
  }

  // backend { unreadCount: number } dönerse
  if ('unreadCount' in data) {
    return data;
  }

  return { unreadCount: 0 };
},

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  markRead: async (id: string): Promise<MarkReadResponse> => {
    const { data } = await apiClient.patch<MarkReadResponse>(`${BASE}/${id}/read`);
    return data;
  },

  /**
   * PATCH /api/v1/notifications/read-all
   */
  markAllRead: async (): Promise<MarkAllReadResponse> => {
    const { data } = await apiClient.patch<MarkAllReadResponse>(`${BASE}/read-all`);
    return data;
  },

  /**
   * DELETE /api/v1/notifications/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};