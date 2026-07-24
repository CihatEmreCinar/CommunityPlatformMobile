import { useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { usePaginatedResource } from './usePaginatedResource';
import { useUnreadCount, unreadCountStore } from './useUnreadCount';
import type { Notification } from '../types/notification.types';

interface UseNotificationsOptions {
  limit?: number;
  pollIntervalMs?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { limit = 20, pollIntervalMs = 30000 } = options;

  // Okunmamış sayısı paylaşılan store'dan gelir (tek poller, tek kaynak).
  const { unreadCount } = useUnreadCount(pollIntervalMs);

  // Sayfa-tabanlı kaynak: cursor = sayfa numarası. İlk sayfa cursor=null → 1.
  const fetchPage = useCallback(
    async (cursor: number | null) => {
      const page = cursor ?? 1;
      const result = await notificationService.getAll({ page, limit });
      return { items: result.items, nextCursor: result.hasMore ? page + 1 : null, hasMore: result.hasMore };
    },
    [limit]
  );

  const {
    items: notifications,
    setItems: setNotifications,
    loading,
    loadingMore,
    error,
    hasMore,
    refresh: refreshList,
    loadMore,
  } = usePaginatedResource<Notification, number>({
    fetchPage,
    loadErrorMessage: 'Bildirimler yüklenemedi.',
    loadMoreErrorMessage: 'Daha fazla yüklenemedi.',
    autoLoad: false,
  });

  const refresh = useCallback(async () => {
    await Promise.all([refreshList(), unreadCountStore.refresh()]);
  }, [refreshList]);

  const markRead = useCallback(async (id: string) => {
    await notificationService.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    );
    unreadCountStore.decrement();
  }, [setNotifications]);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: now })));
    unreadCountStore.reset();
  }, [setNotifications]);

  const remove = useCallback(async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    await notificationService.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.isRead) {
      unreadCountStore.decrement();
    }
  }, [notifications, setNotifications]);

  // İlk yüklemede sadece listeyi çek — okunmamış sayısını store (useUnreadCount) yönetir.
  useEffect(() => {
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
    remove,
    refresh,
  };
}
