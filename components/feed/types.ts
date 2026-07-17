import type { FeedPost, FeedPostMedia } from '../../types/feed.types';

export type AuthorAvatarProps = {
  url: string | null;
  name: string;
  size?: number;
};

export type MediaStripProps = {
  media: FeedPostMedia[];
};

export type PostCardProps = {
  post: FeedPost;
  onLike: (id: string) => void;
  onComment: (post: FeedPost) => void;
  onShare: (post: FeedPost) => void;
  isMine: boolean;
  onPressAuthor?: () => void;
};
