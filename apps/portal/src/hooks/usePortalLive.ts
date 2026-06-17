import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { get, onValue, ref } from "firebase/database";
import type { PortalFeaturedProduct, PortalLiveSession } from "@emperatriz/types";
import { fetchPortalLive } from "@/lib/portal-live";
import { auth, rtdb } from "@/lib/firebase";
import {
  LIVE_PUBLIC_RTD_PATH,
  livePublicSnapshotToPortalSession,
  parseLivePublicSnapshot,
} from "@/lib/live-public-snapshot";

function isPermissionDenied(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  return code === "PERMISSION_DENIED" || code === "permission_denied";
}

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

  const loadFromApi = useCallback(async (): Promise<boolean> => {
    try {
      const result = await fetchPortalLive();
      if (result.session) {
        setSession(result.session);
        setFeaturedProduct(result.session.featuredProduct);
        setFeaturedHistory(result.session.featuredHistory);
        setError(null);
        return true;
      }
      applySnapshot(null);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar el live");
      return false;
    }
  }, [applySnapshot]);

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

    let rtdbUnsub: (() => void) | undefined;
    let cancelled = false;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      rtdbUnsub?.();
      rtdbUnsub = undefined;

      if (cancelled) return;

      if (!user) {
        setLoading(false);
        return;
      }

      const nodeRef = ref(rtdb, LIVE_PUBLIC_RTD_PATH);
      rtdbUnsub = onValue(
        nodeRef,
        (snap) => {
          if (cancelled) return;
          applySnapshot(snap.val());
          setLoading(false);
          setError(null);
        },
        (err) => {
          if (cancelled) return;
          console.error("[usePortalLive]", err);
          void loadFromApi().finally(() => {
            if (!cancelled) setLoading(false);
          });
          if (isPermissionDenied(err)) {
            setError(null);
          } else {
            setError("No se pudo conectar al live en tiempo real.");
          }
        },
      );
    });

    return () => {
      cancelled = true;
      authUnsub();
      rtdbUnsub?.();
    };
  }, [applySnapshot, enabled, loadFromApi]);

  /** Actualización manual: relee RTDB y, si hace falta, re-sincroniza vía API. */
  const reload = useCallback(async () => {
    if (!enabled) return;
    setRefreshing(true);
    setError(null);
    try {
      if (auth.currentUser) {
        const snap = await get(ref(rtdb, LIVE_PUBLIC_RTD_PATH));
        if (snap.exists()) {
          applySnapshot(snap.val());
          return;
        }
      }

      await loadFromApi();
    } catch (err: unknown) {
      if (isPermissionDenied(err)) {
        await loadFromApi();
      } else {
        setError(err instanceof Error ? err.message : "Error al actualizar el live");
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [applySnapshot, enabled, loadFromApi]);

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
