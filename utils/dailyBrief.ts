import { Workshop } from '../types/workshop';

/**
 * Daily Brief (Yaşayan Şehir) bölümü için, YENİ bir servis çağrısı gerektirmeden
 * ekranda zaten yüklenmiş olan `allWorkshops` / `nearby` / `recommended`
 * verisinden türetilen yardımcı fonksiyonlar.
 *
 * Gerçek sosyal aktivite akışı (ör. "Ayşe X'e katıldı") burada YOKTUR —
 * bunun için gerçek bir feed/notification endpoint'i gerekir (bkz.
 * README_PATCH.md "Faz 2"). Bu dosyadaki her şey mevcut Workshop
 * alanlarından (capacity, enrolledCount, startAt) hesaplanır.
 */

const HOUR_MS = 60 * 60 * 1000;

export interface TickerItem {
  id: string;
  /** Emoji zaten metnin içinde geliyor, ör: "📍 Yakınında 4 atölye var" */
  text: string;
}

export interface PulseItem {
  id: string;
  icon: string;
  variant: 'urgent' | 'upcoming';
  /** '{{h}}' token'ı, `highlight` metninin render edileceği yeri işaretler. */
  template: string;
  highlight: string;
  timestamp: string;
  actionLabel?: string;
  workshopId?: string;
}

export interface LevelInfo {
  level: number;
  levelLabel: string;
  progressPercent: number;
}

function spotsLeft(workshop: Workshop): number {
  return workshop.capacity - workshop.enrolledCount;
}

function formatRelativeStart(startAt: string): string {
  const diffMs = new Date(startAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Başladı';
  const diffHours = diffMs / HOUR_MS;
  if (diffHours < 1) return `${Math.max(1, Math.round(diffMs / 60000))} dk sonra`;
  if (diffHours < 24) return `${Math.round(diffHours)} sa sonra`;
  return new Date(startAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

/** Üstteki canlı bilgi bandı (LiveTicker) için öğe listesi üretir. */
export function buildTickerItems(params: {
  nearbyCount: number;
  recommendedCount: number;
  allWorkshops: Workshop[];
}): TickerItem[] {
  const { nearbyCount, recommendedCount, allWorkshops } = params;
  const items: TickerItem[] = [];

  if (nearbyCount > 0) {
    items.push({ id: 'nearby', text: `📍 Yakınında ${nearbyCount} atölye var` });
  }

  allWorkshops
    .filter((w) => spotsLeft(w) > 0 && spotsLeft(w) <= 2)
    .slice(0, 2)
    .forEach((w) =>
      items.push({
        id: `full-${w.id}`,
        text: `🔥 "${w.title}" hızla doluyor! (${spotsLeft(w)} yer kaldı)`,
      })
    );

  allWorkshops
    .filter((w) => {
      const diff = new Date(w.startAt).getTime() - Date.now();
      return diff > 0 && diff < 3 * HOUR_MS;
    })
    .slice(0, 1)
    .forEach((w) =>
      items.push({ id: `soon-${w.id}`, text: `📢 "${w.title}" ${formatRelativeStart(w.startAt)} başlıyor` })
    );

  if (recommendedCount > 0) {
    items.push({ id: 'recommended', text: `⭐ Senin için ${recommendedCount} yeni öneri hazır` });
  }

  return items;
}

/** "Şehrin Nabzı" akışı için öğe listesi üretir (en fazla 5 öğe). */
export function buildCityPulseItems(allWorkshops: Workshop[]): PulseItem[] {
  const items: PulseItem[] = [];

  allWorkshops
    .filter((w) => spotsLeft(w) > 0 && spotsLeft(w) <= 3)
    .sort((a, b) => spotsLeft(a) - spotsLeft(b))
    .slice(0, 3)
    .forEach((w) =>
      items.push({
        id: `pulse-full-${w.id}`,
        icon: 'bolt',
        variant: 'urgent',
        template: '{{h}} için sadece birkaç yer kaldı!',
        highlight: w.title,
        timestamp: `${spotsLeft(w)} yer kaldı`,
        actionLabel: 'Şimdi katıl',
        workshopId: w.id,
      })
    );

  allWorkshops
    .filter((w) => {
      const diff = new Date(w.startAt).getTime() - Date.now();
      return diff > 0 && diff < 24 * HOUR_MS;
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 3)
    .forEach((w) =>
      items.push({
        id: `pulse-soon-${w.id}`,
        icon: 'event',
        variant: 'upcoming',
        template: '{{h}} yakında başlıyor.',
        highlight: w.title,
        timestamp: formatRelativeStart(w.startAt),
        workshopId: w.id,
      })
    );

  return items.slice(0, 5);
}

/** Nearby listesindeki en yakın atölyeyi seçer (backend zaten mesafeye göre sıralı döndürüyor). */
export function pickNearestWorkshop(nearby: Workshop[]): Workshop | undefined {
  return nearby[0];
}

/**
 * "Trend" bento kartı için, yeri hızla dolan / yakında başlayan bir atölye seçer.
 * `excludeId` verilirse (ör. zaten "Yakınımdakiler" kartında gösterilen atölye)
 * onu eler, aynı atölyenin iki kartta birden görünmesini engeller.
 */
export function pickTrendingWorkshop(allWorkshops: Workshop[], excludeId?: string): Workshop | undefined {
  const upcoming = allWorkshops.filter(
    (w) => w.id !== excludeId && new Date(w.startAt).getTime() > Date.now()
  );
  const withSpots = upcoming.filter((w) => spotsLeft(w) > 0);
  const sorted = [...withSpots].sort((a, b) => spotsLeft(a) - spotsLeft(b));
  return sorted[0] ?? upcoming[0];
}

/**
 * XP puanından basit bir seviye/ilerleme hesaplar.
 * VARSAYIM: Backend'de resmi bir seviye eğrisi olmadığı için 500 XP/seviye
 * sabit bir adım kullanıldı. Gerçek bir seviye sistemi varsa (ör. artan eşikler)
 * bu fonksiyonu ona göre güncelle.
 */
const XP_PER_LEVEL = 500;

export function calculateLevelInfo(xp: number): LevelInfo {
  const safeXp = Math.max(0, xp);
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = safeXp % XP_PER_LEVEL;
  return {
    level,
    levelLabel: `Seviye ${level} Kaşif`,
    progressPercent: (xpIntoLevel / XP_PER_LEVEL) * 100,
  };
}
