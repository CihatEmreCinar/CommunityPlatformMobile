import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/notificationService';
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

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(page);
  pageRef.current = page;

  const fetchNotifications = useCallback(async (resetPage = false) => {
    try {
      setError(null);
      const currentPage = resetPage ? 1 : pageRef.current;
      const result = await notificationService.getAll({ page: currentPage, limit });

      if (resetPage) {
        setNotifications(result.items);
        setPage(1);
      } else {
        setNotifications(prev => [...prev, ...result.items]);
      }

      setHasMore(result.hasMore);
    } catch (e) {
      setError('Bildirimler yüklenemedi.');
    }
  }, [limit]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationService.getUnreadCount();
      setUnreadCount(result.unreadCount);
    } catch {
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchNotifications(true), fetchUnreadCount()]);
    setLoading(false);
  }, [fetchNotifications, fetchUnreadCount]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    setPage(nextPage);
    try {
      const result = await notificationService.getAll({ page: nextPage, limit });
      setNotifications(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
    } catch {
      setError('Daha fazla yüklenemedi.');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, limit]);

  const markRead = useCallback(async (id: string) => {
    await notificationService.markRead(id);
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    const now = new Date().toISOString();
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, readAt: now }))
    );
    setUnreadCount(0);
  }, []);

  const remove = useCallback(async (id: string) => {
    const target = notifications.find(n => n.id === id);
    await notificationService.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (target && !target.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notifications]);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!pollIntervalMs) return;
    const interval = setInterval(fetchUnreadCount, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchUnreadCount, pollIntervalMs]);

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
