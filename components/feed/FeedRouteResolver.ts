import type { FeedPost } from '../../types/feed.types';
import type { FeedConfiguration } from './FeedConfiguration';

export function isOwnPost(post: FeedPost, currentUserId: string | null): boolean {
  if (!currentUserId) return false;
  return post.authorType === 'Cafe'
    ? post.cafeId === currentUserId
    : post.employerId === currentUserId;
}

// NOT: Akış'ta profillere dokununca ilgili profile yönlendirir. Kendi
// postuna dokununca kendi profil sekmesine, başkasının postuna dokununca
// o kullanıcının genel profil ekranına gider.
//
// `availableProfileRoutes`, hedef rolün route grubunda o profil tipi için
// bir ekran olup olmadığını kontrol eder (örn. (employee) grubunda henüz
// bir cafe public profil ekranı yok). `employee` alanı şu an hiçbir
// authorType tarafından üretilmiyor (FeedPost.authorType 'Employer' | 'Cafe'),
// ileride employee'ler de post paylaşabilir hale gelirse diye ayrılmıştır —
// bu yüzden burada if/else ile değil, config üzerinden kontrol edilir.
export function resolveAuthorRoute(
  post: FeedPost,
  isMine: boolean,
  config: FeedConfiguration,
): string | null {
  if (isMine) {
    return `/${config.routePrefix}/(tabs)/profile`;
  }

  if (post.authorType === 'Cafe') {
    if (!config.availableProfileRoutes.cafe || !post.cafeId) return null;
    return `/${config.routePrefix}/cafe/${post.cafeId}`;
  }

  if (!config.availableProfileRoutes.employer || !post.employerId) return null;
  return `/${config.routePrefix}/employer/${post.employerId}`;
}
