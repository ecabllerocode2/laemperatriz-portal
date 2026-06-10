import { useCallback, useEffect, useState } from "react";
import type { PortalShipmentsResponse } from "@emperatriz/types";
import { fetchPortalShipments } from "@/lib/portal-cycle";
import { useUiStore } from "@/stores/ui.store";

const EMPTY: PortalShipmentsResponse = {
  active: null,
  history: [],
  needsShippingAddress: false,
  shippingAddress: null,
};

export function usePortalShipments(enabled = true) {
  const reloadTick = useUiStore((s) => s.profileReloadTick);
  const [data, setData] = useState<PortalShipmentsResponse>(EMPTY);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPortalShipments();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar envíos");
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload, reloadTick]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => void reload(), 60_000);
    return () => window.clearInterval(id);
  }, [enabled, reload]);

  return { ...data, loading, error, reload };
}
