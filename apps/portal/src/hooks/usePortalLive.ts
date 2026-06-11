import { useCallback, useEffect, useState } from "react";
import type { PortalFeaturedProduct, PortalLiveSession } from "@emperatriz/types";
import { fetchPortalLive } from "@/lib/portal-live";

export function usePortalLive(enabled = true, pollIntervalMs = 15_000) {
  const [session, setSession] = useState<PortalLiveSession | null>(null);
  const [featuredProduct, setFeaturedProduct] = useState<PortalFeaturedProduct | null>(null);
  const [featuredHistory, setFeaturedHistory] = useState<PortalFeaturedProduct[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
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
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setSession(null);
      setFeaturedProduct(null);
      setFeaturedHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    void reload();
  }, [enabled, reload]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => void reload(), pollIntervalMs);
    return () => window.clearInterval(id);
  }, [enabled, pollIntervalMs, reload]);

  return { session, featuredProduct, featuredHistory, loading, error, reload };
}
