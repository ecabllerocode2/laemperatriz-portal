import { timestampToMs } from "@/lib/timestamp";

export const STORE_PRODUCT_NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Producto listado en tienda dentro de los últimos 7 días (ventana móvil). */
export function isStoreProductNew(
  storeListedAt: string | undefined,
  nowMs: number = Date.now(),
): boolean {
  const listedMs = timestampToMs(storeListedAt);
  if (listedMs == null) return false;
  return listedMs >= nowMs - STORE_PRODUCT_NEW_WINDOW_MS && listedMs <= nowMs;
}
