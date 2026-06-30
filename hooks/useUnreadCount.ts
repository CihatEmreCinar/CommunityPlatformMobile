import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';

export function useUnreadCount(pollIntervalMs = 30000) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = useCallback(async () => {
    try {
      const result = await notificationService.getUnreadCount();
      setUnreadCount(result.unreadCount);
    } catch {
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetch, pollIntervalMs]);

  return { unreadCount, refresh: fetch };
}
