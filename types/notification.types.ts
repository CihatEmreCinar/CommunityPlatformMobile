export type NotificationType =
  // Workshop
  | 'WorkshopPublished'
  | 'WorkshopReminder'
  | 'WorkshopCompleted'
  // Başvuru
  | 'ApplicationReceived'
  | 'ApplicationApproved'
  | 'ApplicationRejected'
  // İçerik moderasyonu
  | 'ContentPendingApproval'
  | 'ContentApproved'
  | 'ContentRejected'
  // Sosyal
  | 'NewFollower'
  | 'PostLiked'
  | 'PostCommented'
  | 'PostShared';

export type NotificationChannel = 'in_app' | 'push' | 'email';

export interface NotificationMetadata {
  workshopId?: string;
  postId?: string;
  actorId?: string;
  actorName?: string;
  commentPreview?: string;
  route?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  channel: NotificationChannel;
  metadata: NotificationMetadata | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
}

export interface NotificationListResult {
  items: Notification[];
  page: number;
  limit: number;
  hasMore: boolean;
  total?: number;
}

export interface UnreadCountResult {
  unreadCount: number;
}

export interface MarkReadResponse {
  id: string;
  isRead: boolean;
  readAt: string;
}

export interface MarkAllReadResponse {
  markedRead: number;
}