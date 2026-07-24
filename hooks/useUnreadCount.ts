import { useSyncExternalStore } from 'react';
import { notificationService } from '../services/notificationService';

/**
 * Okunmamış bildirim sayısı için TEK paylaşılan kaynak (module-level store).
 *
 * Daha önce hem useUnreadCount (dashboard/home rozetleri) hem useNotifications
 * (bildirim ekranı) bağımsız olarak getUnreadCount() çağırıp ayrı polling timer'ı
 * çalıştırıyordu. Artık her iki taraf da bu store'a abone olur: kaç ekran açık olursa
 * olsun tek bir poller döner ve değer tek noktadan güncellenir. Bildirim ekranındaki
 * optimistic işlemler (markRead/markAllRead/remove) rozeti de anında günceller.
 */

let unreadCount = 0;
let pollIntervalMs = 30000;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setCount(value: number) {
  if (value === unreadCount) return;
  unreadCount = value;
  emit();
}

async function fetchUnreadCount() {
  try {
    const result = await notificationService.getUnreadCount();
    setCount(result.unreadCount);
  } catch {
    // sessiz hata
  }
}

function startPolling() {
  if (pollTimer || !pollIntervalMs) return;
  pollTimer = setInterval(fetchUnreadCount, pollIntervalMs);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  subscriberCount += 1;
  if (subscriberCount === 1) {
    // İlk abone: hemen bir kez çek ve ortak polling'i başlat.
    fetchUnreadCount();
    startPolling();
  }
  return () => {
    listeners.delete(listener);
    subscriberCount -= 1;
    if (subscriberCount === 0) stopPolling();
  };
}

const getSnapshot = () => unreadCount;

/** Optimistic güncellemeler için store mutasyonları (useNotifications kullanır). */
export const unreadCountStore = {
  refresh: fetchUnreadCount,
  set: setCount,
  decrement: (by = 1) => setCount(Math.max(0, unreadCount - by)),
  reset: () => setCount(0),
};

export function useUnreadCount(intervalMs = 30000) {
  pollIntervalMs = intervalMs;
  const count = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { unreadCount: count, refresh: fetchUnreadCount };
}
