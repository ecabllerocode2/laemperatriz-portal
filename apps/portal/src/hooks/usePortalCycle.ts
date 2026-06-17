import { useCallback, useEffect, useState } from "react";
import { fetchPortalCycle, type PortalCycleResponse } from "@/lib/portal-cycle";
import { useUiStore } from "@/stores/ui.store";

const EMPTY: PortalCycleResponse = {
  cycle: null,
  needsShippingAddress: false,
  shippingAddress: null,
};

export interface UsePortalCycleOptions {
  enabled?: boolean;
  /** Si false, no hace poll periódico (p. ej. en /live). reload() sigue disponible. */
  pollWhileActive?: boolean;
}

function resolveOptions(options: boolean | UsePortalCycleOptions): UsePortalCycleOptions {
  if (typeof options === "boolean") {
    return { enabled: options, pollWhileActive: true };
  }
  return {
    enabled: options.enabled ?? true,
    pollWhileActive: options.pollWhileActive ?? true,
  };
}

export function usePortalCycle(options: boolean | UsePortalCycleOptions = true) {
  const { enabled, pollWhileActive } = resolveOptions(options);
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
    if (!enabled || !pollWhileActive || !data?.cycle) return;
    const id = window.setInterval(() => void reload(), 60_000);
    return () => window.clearInterval(id);
  }, [enabled, pollWhileActive, data?.cycle, reload]);

  return { ...(data ?? EMPTY), loading, error, reload };
}
