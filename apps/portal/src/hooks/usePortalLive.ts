import { useCallback, useEffect, useMemo, useState } from "react";
import { get, onValue, ref } from "firebase/database";
import type { PortalFeaturedProduct, PortalLiveSession } from "@emperatriz/types";
import { fetchPortalLive } from "@/lib/portal-live";
import { rtdb } from "@/lib/firebase";
import {
  LIVE_PUBLIC_RTD_PATH,
  livePublicSnapshotToPortalSession,
  parseLivePublicSnapshot,
} from "@/lib/live-public-snapshot";

/** Estado del live vía RTDB push — sin polling Firestore. */
export function usePortalLive(enabled = true) {
  const [session, setSession] = useState<PortalLiveSession | null>(null);
  const [featuredProduct, setFeaturedProduct] = useState<PortalFeaturedProduct | null>(null);
  const [featuredHistory, setFeaturedHistory] = useState<PortalFeaturedProduct[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const applySnapshot = useCallback((raw: unknown) => {
    const parsed = parseLivePublicSnapshot(raw);
    if (!parsed) {
      setSession(null);
      setFeaturedProduct(null);
      setFeaturedHistory([]);
      setVersion(0);
      return;
    }

    const portalSession = livePublicSnapshotToPortalSession(parsed);
    setSession(portalSession);
    setFeaturedProduct(parsed.featuredProduct);
    setFeaturedHistory(parsed.featuredHistory);
    setVersion(parsed.version);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSession(null);
      setFeaturedProduct(null);
      setFeaturedHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const nodeRef = ref(rtdb, LIVE_PUBLIC_RTD_PATH);
    const unsub = onValue(
      nodeRef,
      (snap) => {
        applySnapshot(snap.val());
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[usePortalLive]", err);
        setError("No se pudo conectar al live en tiempo real.");
        setLoading(false);
      },
    );

    return () => unsub();
  }, [applySnapshot, enabled]);

  /** Actualización manual: relee RTDB y, si hace falta, re-sincroniza vía API. */
  const reload = useCallback(async () => {
    if (!enabled) return;
    setRefreshing(true);
    setError(null);
    try {
      const snap = await get(ref(rtdb, LIVE_PUBLIC_RTD_PATH));
      if (snap.exists()) {
        applySnapshot(snap.val());
        return;
      }

      const result = await fetchPortalLive();
      if (result.session) {
        setSession(result.session);
        setFeaturedProduct(result.session.featuredProduct);
        setFeaturedHistory(result.session.featuredHistory);
      } else {
        applySnapshot(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar el live");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [applySnapshot, enabled]);

  const liveVersion = useMemo(() => version, [version]);

  return {
    session,
    featuredProduct,
    featuredHistory,
    loading,
    refreshing,
    error,
    reload,
    liveVersion,
  };
}
