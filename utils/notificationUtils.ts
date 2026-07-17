import type { Notification, NotificationMetadata, NotificationType } from '../types/notification.types';
import type { IconName } from '../components/ui/Icon';

export function parseMetadata(metadata?: NotificationMetadata | null): NotificationMetadata | null {
  return metadata ?? null;
}

export function getNotificationRoute(notification: Notification): string | null {
  const meta = parseMetadata(notification.metadata);
  if (!meta) return null;

  if (meta.route?.startsWith('/')) {
    return meta.route;
  }

  if (meta.route === 'workshop/detail' && typeof meta.workshopId === 'string') {
    return `/(employee)/workshop/${meta.workshopId}`;
  }

  if (notification.type === 'ApplicationReceived' && typeof meta.enrollmentId === 'string') {
    return '/(employer)/enrollments';
  }

  if (
    (notification.type === 'ApplicationApproved' || notification.type === 'WorkshopCompleted') &&
    typeof meta.workshopId === 'string'
  ) {
    return `/(employee)/workshop/${meta.workshopId}`;
  }

  if (notification.type === 'BookingRequested') {
    return '/(cafe)/(tabs)/bookings';
  }

  if (notification.type === 'BookingApproved' || notification.type === 'BookingRejected') {
    return '/(employer)/bookings';
  }

  return null;
}

type NotificationConfig = {
  icon: IconName;
  color: string;
  label: string;
};

const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  // ─── Workshop ───────────────────────────────────────────────────────────────
  WorkshopPublished: {
    icon: 'megaphoneOutline',
    color: '#3B82F6',
    label: 'Yeni Workshop',
  },
  WorkshopReminder: {
    icon: 'alarmOutline',
    color: '#F59E0B',
    label: 'Hatırlatma',
  },
  WorkshopCompleted: {
    icon: 'checkmarkCircleOutline',
    color: '#10B981',
    label: 'Tamamlandı',
  },
  // ─── Başvuru ────────────────────────────────────────────────────────────────
  ApplicationReceived: {
    icon: 'documentTextOutline',
    color: '#8B5CF6',
    label: 'Başvuru Alındı',
  },
  ApplicationApproved: {
    icon: 'checkmarkDoneOutline',
    color: '#10B981',
    label: 'Başvuru Onaylandı',
  },
  ApplicationRejected: {
    icon: 'closeCircleOutline',
    color: '#EF4444',
    label: 'Başvuru Reddedildi',
  },
  // ─── İçerik moderasyonu ─────────────────────────────────────────────────────
  ContentPendingApproval: {
    icon: 'timeOutline',
    color: '#F59E0B',
    label: 'Onay Bekliyor',
  },
  ContentApproved: {
    icon: 'shieldCheckmarkOutline',
    color: '#10B981',
    label: 'İçerik Onaylandı',
  },
  ContentRejected: {
    icon: 'shieldOutline',
    color: '#EF4444',
    label: 'İçerik Reddedildi',
  },
  // ─── Sosyal ─────────────────────────────────────────────────────────────────
  NewFollower: {
    icon: 'follow',
    color: '#6366F1',
    label: 'Yeni Takipçi',
  },
  PostLiked: {
    icon: 'heartOutline',
    color: '#EC4899',
    label: 'Gönderi Beğenildi',
  },
  PostCommented: {
    icon: 'chatbubbleOutline',
    color: '#0EA5E9',
    label: 'Yorum Yapıldı',
  },
  PostShared: {
    icon: 'shareSocialOutline',
    color: '#14B8A6',
    label: 'Gönderi Paylaşıldı',
  },
  // ─── Rezervasyon ────────────────────────────────────────────────────────────
  BookingRequested: {
    icon: 'calendarOutline',
    color: '#8B5CF6',
    label: 'Yeni Rezervasyon Talebi',
  },
  BookingApproved: {
    icon: 'checkmarkDoneOutline',
    color: '#10B981',
    label: 'Rezervasyon Onaylandı',
  },
  BookingRejected: {
    icon: 'closeCircleOutline',
    color: '#EF4444',
    label: 'Rezervasyon Reddedildi',
  },
};

export function getNotificationConfig(type: NotificationType): NotificationConfig {
  return NOTIFICATION_CONFIG[type] ?? {
    icon: 'notificationsOutline',
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