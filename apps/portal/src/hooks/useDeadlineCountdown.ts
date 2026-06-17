import { useEffect, useMemo, useState } from "react";
import { timestampToMs } from "@/lib/timestamp";

/**
 * Cuenta regresiva local desde un deadline absoluto (sin depender del poll del ciclo).
 * Al salir del live basta un reload: el deadline no cambia, solo se recalcula ms restantes.
 */
export function useDeadlineCountdown(
  deadline: unknown,
  enabled = true,
  fallbackRemainingMs = 0,
): number {
  const deadlineMs = useMemo(() => timestampToMs(deadline), [deadline]);

  const [remainingMs, setRemainingMs] = useState(() => {
    if (deadlineMs != null) return Math.max(0, deadlineMs - Date.now());
    return Math.max(0, fallbackRemainingMs);
  });

  useEffect(() => {
    if (!enabled) {
      setRemainingMs(0);
      return;
    }

    if (deadlineMs == null) {
      setRemainingMs(Math.max(0, fallbackRemainingMs));
      return;
    }

    const tick = () => setRemainingMs(Math.max(0, deadlineMs - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [deadlineMs, enabled, fallbackRemainingMs]);

  return remainingMs;
}
