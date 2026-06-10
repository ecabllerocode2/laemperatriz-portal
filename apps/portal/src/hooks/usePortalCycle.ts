import { useCallback, useEffect, useState } from "react";
import { fetchPortalCycle, type PortalCycleResponse } from "@/lib/portal-cycle";
import { useUiStore } from "@/stores/ui.store";

const EMPTY: PortalCycleResponse = {
  cycle: null,
  needsShippingAddress: false,
  shippingAddress: null,
};

export function usePortalCycle(enabled = true) {
  const reloadTick = useUiStore((s) => s.profileReloadTick);
  const [data, setData] = useState<PortalCycleResponse>(EMPTY);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPortalCycle();
      setData(result ?? EMPTY);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar ciclo");
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload, reloadTick]);

  useEffect(() => {
    if (!enabled || !data?.cycle) return;
    const id = window.setInterval(() => void reload(), 60_000);
    return () => window.clearInterval(id);
  }, [enabled, data?.cycle, reload]);

  return { ...(data ?? EMPTY), loading, error, reload };
}
