import { useCallback, useEffect, useRef, useState } from "react";
import type { PortalStoreProduct } from "@emperatriz/types";
import { fetchStoreProducts } from "@/lib/portal-store";

const PAGE_SIZE = 12;

export function usePortalStoreCatalog(filters: {
  search: string;
  categoryId: string | null;
}) {
  const [products, setProducts] = useState<PortalStoreProduct[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadPage = useCallback(
    async (mode: "reset" | "more", nextCursor?: string | null) => {
      const requestId = ++requestIdRef.current;
      if (mode === "reset") setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const result = await fetchStoreProducts({
          limit: PAGE_SIZE,
          ...(mode === "more" && nextCursor ? { cursor: nextCursor } : {}),
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        });

        if (requestId !== requestIdRef.current) return;

        setProducts((prev) =>
          mode === "reset" ? result.products : [...prev, ...result.products],
        );
        setCursor(result.pagination.nextCursor);
        setHasMore(result.pagination.hasMore);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : "No pudimos cargar la tienda.");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [filters.categoryId, filters.search],
  );

  useEffect(() => {
    void loadPage("reset");
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || !cursor) return;
    void loadPage("more", cursor);
  }, [cursor, hasMore, loadPage, loadingMore]);

  const reload = useCallback(() => loadPage("reset"), [loadPage]);

  return {
    products,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    reload,
  };
}
