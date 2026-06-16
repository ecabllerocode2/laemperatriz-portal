import { useCallback, useEffect, useState } from "react";
import type { PortalFeaturedProduct, PortalLiveSession } from "@emperatriz/types";
import { fetchPortalLive } from "@/lib/portal-live";

export function usePortalLive(enabled = true, pollIntervalMs = 8_000) {
  const [session, setSession] = useState<PortalLiveSession | null>(null);
  const [featuredProduct, setFeaturedProduct] = useState<PortalFeaturedProduct | null>(null);
  const [featuredHistory, setFeaturedHistory] = useState<PortalFeaturedProduct[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncLive = useCallback(
    async (manual = false) => {
      if (!enabled) return;
      if (manual) setRefreshing(true);
      setError(null);
      try {
        const result = await fetchPortalLive();
        setSession(result.session);
        setFeaturedProduct(result.session?.featuredProduct ?? null);
        setFeaturedHistory(result.session?.featuredHistory ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar el live");
        setSession(null);
        setFeaturedProduct(null);
        setFeaturedHistory([]);
      } finally {
        setLoading(false);
        if (manual) setRefreshing(false);
      }
    },
    [enabled],
  );

  const reload = useCallback(() => syncLive(true), [syncLive]);

  useEffect(() => {
    if (!enabled) {
      setSession(null);
      setFeaturedProduct(null);
      setFeaturedHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    void syncLive(false);
  }, [enabled, syncLive]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => void syncLive(false), pollIntervalMs);
    return () => window.clearInterval(id);
  }, [enabled, pollIntervalMs, syncLive]);

  return { session, featuredProduct, featuredHistory, loading, refreshing, error, reload };
}
