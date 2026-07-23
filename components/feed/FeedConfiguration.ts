// Feed'in davranışı role göre değil, config'e göre değişir. Yeni bir rol/actor
// tipi eklendiğinde FeedScreen, FeedRouteResolver veya PostCard'a dokunmadan
// sadece burada yeni bir config tanımlamak yeterli olmalıdır.
import { Colors } from '../../constants/theme';

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

// Feed genelinde tüm rollerde aynı marka rengi kullanılır — tema primary'sinden.
export const FEED_ACCENT_COLOR = Colors.primary;

export const employeeFeedConfig: FeedConfiguration = {
  routePrefix: '(employee)',
  canCreatePosts: false,
  availableProfileRoutes: {
    employee: true,
    employer: true,
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
