export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  body: string;
  channel: string;
  metadata?: string | Record<string, unknown> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export type NotificationListDto = NotificationDto[];

export interface UnreadCountDto {
  unreadCount: number;
}

export interface MarkReadDto {
  id: string;
  isRead: boolean;
  readAt: string;
}

export interface MarkAllReadDto {
  markedRead: number;
}