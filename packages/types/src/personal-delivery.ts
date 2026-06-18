import { PERSONAL_DELIVERY_POSTAL_CODES } from "./personal-delivery-postal-codes.js";

export type FulfillmentDeliveryMethod = "personal" | "courier";

/** Mínimo de compra en el ciclo para entrega personal gratis (zonas elegibles). */
export const PERSONAL_DELIVERY_MIN_PURCHASE_MXN = 700;

export function normalizePostalCode(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "").slice(0, 5);
}

export function isPersonalDeliveryPostalCode(postalCode: string | null | undefined): boolean {
  const normalized = normalizePostalCode(postalCode);
  if (normalized.length < 5) return false;
  return PERSONAL_DELIVERY_POSTAL_CODES.has(normalized);
}
