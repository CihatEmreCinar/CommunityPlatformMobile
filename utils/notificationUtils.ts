import type { Notification, NotificationMetadata, NotificationType } from '../types/notification.types';

export function parseMetadata(metadata?: string | null): NotificationMetadata | null {
  if (!metadata) return null;
  try {
    return JSON.parse(metadata) as NotificationMetadata;
  } catch {
    return null;
  }
}

export function getNotificationRoute(notification: Notification): string | null {
  const meta = parseMetadata(notification.metadata);
  return meta?.route ?? null;
}

type NotificationConfig = {
  icon: string;
  color: string;
  label: string;
};

const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  // ─── Workshop ───────────────────────────────────────────────────────────────
  WorkshopPublished: {
    icon: 'megaphone-outline',
    color: '#3B82F6',
    label: 'Yeni Workshop',
  },
  WorkshopReminder: {
    icon: 'alarm-outline',
    color: '#F59E0B',
    label: 'Hatırlatma',
  },
  WorkshopCompleted: {
    icon: 'checkmark-circle-outline',
    color: '#10B981',
    label: 'Tamamlandı',
  },
  // ─── Başvuru ────────────────────────────────────────────────────────────────
  ApplicationReceived: {
    icon: 'document-text-outline',
    color: '#8B5CF6',
    label: 'Başvuru Alındı',
  },
  ApplicationApproved: {
    icon: 'checkmark-done-outline',
    color: '#10B981',
    label: 'Başvuru Onaylandı',
  },
  ApplicationRejected: {
    icon: 'close-circle-outline',
    color: '#EF4444',
    label: 'Başvuru Reddedildi',
  },
  // ─── İçerik moderasyonu ─────────────────────────────────────────────────────
  ContentPendingApproval: {
    icon: 'time-outline',
    color: '#F59E0B',
    label: 'Onay Bekliyor',
  },
  ContentApproved: {
    icon: 'shield-checkmark-outline',
    color: '#10B981',
    label: 'İçerik Onaylandı',
  },
  ContentRejected: {
    icon: 'shield-outline',
    color: '#EF4444',
    label: 'İçerik Reddedildi',
  },
  // ─── Sosyal ─────────────────────────────────────────────────────────────────
  NewFollower: {
    icon: 'person-add-outline',
    color: '#6366F1',
    label: 'Yeni Takipçi',
  },
  PostLiked: {
    icon: 'heart-outline',
    color: '#EC4899',
    label: 'Gönderi Beğenildi',
  },
  PostCommented: {
    icon: 'chatbubble-outline',
    color: '#0EA5E9',
    label: 'Yorum Yapıldı',
  },
  PostShared: {
    icon: 'share-social-outline',
    color: '#14B8A6',
    label: 'Gönderi Paylaşıldı',
  },
};

export function getNotificationConfig(type: NotificationType): NotificationConfig {
  return NOTIFICATION_CONFIG[type] ?? {
    icon: 'notifications-outline',
    color: '#6B7280',
    label: 'Bildirim',
  };
}

export function formatNotificationTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Az önce';
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHour < 24) return `${diffHour} sa önce`;
  if (diffDay < 7) return `${diffDay} gün önce`;

  return created.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
}