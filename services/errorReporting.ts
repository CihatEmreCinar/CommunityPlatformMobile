import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();

/**
 * DSN tanımlıysa Sentry'yi başlatır; tanımlı değilse hiçbir şey yapmaz
 * (crash reporting sessizce devre dışı kalır, uygulama normal çalışmaya devam eder).
 * DSN'i etkinleştirmek için .env.local'e EXPO_PUBLIC_SENTRY_DSN ekleyin
 * (bkz. .env.example).
 */
export function initErrorReporting() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    // Production'da gürültüyü azaltmak için sadece hataları gönder,
    // performans/tracing örneklemesi açık değil.
    tracesSampleRate: 0,
    debug: __DEV__,
    enabled: !__DEV__,
  });
}

/**
 * ErrorBoundary gibi yerlerden yakalanan hataları Sentry'ye iletir.
 * DSN tanımlı değilse no-op'tur (Sentry.init hiç çağrılmadığı için
 * captureException zaten sessizce hiçbir şey yapmaz).
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (!dsn) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
