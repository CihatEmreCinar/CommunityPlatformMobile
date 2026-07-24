import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

export interface ResourcePage<T, C> {
  items: T[];
  /** Bir sonraki sayfayı çekmek için kullanılacak imleç; daha fazla yoksa null. */
  nextCursor: C | null;
  hasMore: boolean;
}

export interface UsePaginatedResourceOptions<T, C> {
  /** cursor null ise ilk sayfa. Cursor tipi cursor-tabanlı (string) veya sayfa-tabanlı (number) olabilir. */
  fetchPage: (cursor: C | null) => Promise<ResourcePage<T, C>>;
  loadErrorMessage?: string;
  loadMoreErrorMessage?: string;
  /** true (default) ise mount'ta ilk sayfa otomatik yüklenir. */
  autoLoad?: boolean;
}

export interface UsePaginatedResource<T> {
  items: T[];
  /** Optimistic güncellemeler (like/mark-read/remove) için dışarı açılır. */
  setItems: Dispatch<SetStateAction<T[]>>;
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

/**
 * loading / loadingMore / refreshing / error / hasMore / refresh / loadMore desenini
 * tek yerde toplayan genel sayfalama hook'u. Hem cursor-tabanlı (useFeed) hem
 * sayfa-tabanlı (useNotifications) kaynakları destekler — fark yalnızca fetchPage'in
 * döndürdüğü nextCursor'da.
 */
export function usePaginatedResource<T, C = string>({
  fetchPage,
  loadErrorMessage = 'İçerik yüklenemedi.',
  loadMoreErrorMessage = 'Daha fazla yüklenemedi.',
  autoLoad = true,
}: UsePaginatedResourceOptions<T, C>): UsePaginatedResource<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<C | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const page = await fetchPage(null);
      cursorRef.current = page.nextCursor;
      setItems(page.items);
      setHasMore(page.hasMore);
    } catch {
      setError(loadErrorMessage);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchPage, loadErrorMessage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || cursorRef.current == null) return;
    setLoadingMore(true);
    try {
      const page = await fetchPage(cursorRef.current);
      cursorRef.current = page.nextCursor;
      setItems((prev) => [...prev, ...page.items]);
      setHasMore(page.hasMore);
    } catch {
      setError(loadMoreErrorMessage);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, fetchPage, loadMoreErrorMessage]);

  useEffect(() => {
    if (autoLoad) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, setItems, loading, loadingMore, refreshing, error, setError, hasMore, refresh, loadMore };
}
