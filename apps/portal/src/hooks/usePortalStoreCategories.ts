import { useEffect, useState } from "react";
import type { Category } from "@emperatriz/types";
import {
  PORTAL_CATEGORIES_CACHE_KEY,
  readPortalCatalogCache,
  writePortalCatalogCache,
} from "@/lib/portal-catalog-cache";
import { fetchStoreCategories } from "@/lib/portal-store";

export function usePortalStoreCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const cached = readPortalCatalogCache<Category[]>(PORTAL_CATEGORIES_CACHE_KEY);
    if (cached) {
      setCategories(cached);
      setLoading(false);
    }

    void fetchStoreCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(data);
          writePortalCatalogCache(PORTAL_CATEGORIES_CACHE_KEY, data);
        }
      })
      .catch(() => {
        if (!cancelled && !cached) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}
