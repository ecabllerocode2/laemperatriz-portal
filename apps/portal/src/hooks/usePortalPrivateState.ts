import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { get, onValue, ref } from "firebase/database";
import type { PortalPrivateSnapshot } from "@emperatriz/types";
import { auth, rtdb } from "@/lib/firebase";
import {
  PORTAL_PRIVATE_RTD_PATH,
  parsePortalPrivateSnapshot,
} from "@/lib/portal-private-snapshot";

function isPermissionDenied(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  return code === "PERMISSION_DENIED" || code === "permission_denied";
}

/** Estado privado de compra vía RTDB — espejo en tiempo real de Firestore. */
export function usePortalPrivateState(uid: string | undefined) {
  const [snapshot, setSnapshot] = useState<PortalPrivateSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(Boolean(uid));

  const applySnapshot = useCallback((raw: unknown) => {
    setSnapshot(parsePortalPrivateSnapshot(raw));
    setConnected(true);
  }, []);

  useEffect(() => {
    if (!uid) {
      setSnapshot(null);
      setConnected(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    let rtdbUnsub: (() => void) | undefined;
    let cancelled = false;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      rtdbUnsub?.();
      rtdbUnsub = undefined;

      if (cancelled) return;

      if (!user || user.uid !== uid) {
        setSnapshot(null);
        setConnected(false);
        setLoading(false);
        return;
      }

      const nodeRef = ref(rtdb, PORTAL_PRIVATE_RTD_PATH(uid));
      rtdbUnsub = onValue(
        nodeRef,
        (snap) => {
          if (cancelled) return;
          applySnapshot(snap.val());
          setLoading(false);
        },
        (err) => {
          if (cancelled) return;
          console.error("[usePortalPrivateState]", err);
          setConnected(false);
          setLoading(false);
          if (!isPermissionDenied(err)) {
            console.warn("RTDB portalPrivate no disponible; se usa perfil Firestore.");
          }
        },
      );
    });

    return () => {
      cancelled = true;
      authUnsub();
      rtdbUnsub?.();
    };
  }, [applySnapshot, uid]);

  const refresh = useCallback(async () => {
    if (!uid || !auth.currentUser) return;
    try {
      const snap = await get(ref(rtdb, PORTAL_PRIVATE_RTD_PATH(uid)));
      if (snap.exists()) {
        applySnapshot(snap.val());
      }
    } catch (err) {
      console.error("[usePortalPrivateState.refresh]", err);
    }
  }, [applySnapshot, uid]);

  return {
    snapshot,
    canPurchase: snapshot?.canPurchase ?? false,
    blockReason: snapshot?.blockReason ?? null,
    cartOpeningRequired: snapshot?.cartOpeningRequired ?? false,
    depositStatus: snapshot?.depositStatus ?? null,
    toast: snapshot?.toast ?? null,
    connected,
    loading,
    refresh,
  };
}
