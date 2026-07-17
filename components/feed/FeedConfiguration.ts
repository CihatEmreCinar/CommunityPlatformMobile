// ─── Feed Configuration ──────────────────────────────────────────────────────
// Feed'in davranışı role göre değil, config'e göre değişir. Yeni bir rol/actor
// tipi (Admin, Moderator, Organization, University vb.) eklendiğinde FeedScreen,
// FeedRouteResolver veya PostCard'a dokunmadan sadece burada yeni bir config
// tanımlamak yeterli olmalıdır.

export type AvailableProfileRoutes = {
  employee: boolean;
  employer: boolean;
  cafe: boolean;
};

export type FeedConfiguration = {
  routePrefix: '(employee)' | '(employer)' | '(cafe)';
  canCreatePosts: boolean;
  availableProfileRoutes: AvailableProfileRoutes;
};

// Feed genelinde tüm rollerde aynı marka rengi kullanılıyor (notifications'ın
// aksine burada role göre değişen bir accent yok) — tek yerden export edilir.
export const FEED_ACCENT_COLOR = '#0F766E';

export const employeeFeedConfig: FeedConfiguration = {
  routePrefix: '(employee)',
  canCreatePosts: false,
  availableProfileRoutes: {
    employee: true,
    employer: true,
    // (employee) route grubunda bir cafe public profil ekranı henüz yok.
    cafe: false,
  },
};

export const employerFeedConfig: FeedConfiguration = {
  routePrefix: '(employer)',
  canCreatePosts: true,
  availableProfileRoutes: {
    employee: true,
    employer: true,
    cafe: true,
  },
};

export const cafeFeedConfig: FeedConfiguration = {
  routePrefix: '(cafe)',
  canCreatePosts: true,
  availableProfileRoutes: {
    employee: true,
    employer: true,
    cafe: true,
  },
};
