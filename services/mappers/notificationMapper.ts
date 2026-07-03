import type {
  Notification,
  NotificationListResult,
  NotificationMetadata,
} from '../../types/notification.types';
import type {
  NotificationDto,
  NotificationListDto,
} from '../../types/notification.api';

function parseMetadata(
  metadata?: string | Record<string, unknown> | null
): NotificationMetadata | null {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata) as NotificationMetadata;
    } catch {
      return null;
    }
  }

  return metadata as NotificationMetadata;
}

export function mapNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    type: dto.type as Notification['type'],
    title: dto.title,
    body: dto.body,
    channel: dto.channel as Notification['channel'],
    metadata: parseMetadata(dto.metadata),
    isRead: dto.isRead,
    readAt: dto.readAt ?? null,
    createdAt: dto.createdAt,
  };
}

export function mapNotificationList(
  dto: NotificationListDto,
  page: number,
  limit: number
): NotificationListResult {
  const items = dto.map(mapNotification);

  return {
    items,
    page,
    limit,
    hasMore: items.length === limit,
  };
}