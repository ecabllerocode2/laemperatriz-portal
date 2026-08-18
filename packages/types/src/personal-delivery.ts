import { PERSONAL_DELIVERY_POSTAL_CODES } from "./personal-delivery-postal-codes.js";

export type FulfillmentDeliveryMethod = "personal" | "courier";

/** Mínimo de compra en el ciclo para entrega personal gratis (zonas elegibles). */
export const PERSONAL_DELIVERY_MIN_PURCHASE_MXN = 700;

export function normalizePostalCode(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "").slice(0, 5);
}

export function resolveCustomerPostalCode(
  customer:
    | {
        postalCode?: string | null;
        shippingAddressDetail?: { postalCode?: string | null } | null;
        notes?: string | null;
      }
    | null
    | undefined,
): string {
  const direct = normalizePostalCode(customer?.postalCode);
  if (direct.length >= 5) return direct;

  const fromDetail = normalizePostalCode(customer?.shippingAddressDetail?.postalCode);
  if (fromDetail.length >= 5) return fromDetail;

  const notes = customer?.notes ?? "";
  const match = notes.match(/CP:\s*(\d{5,6})/i);
  if (match?.[1]) return normalizePostalCode(match[1]);

  return direct || fromDetail;
}

export function isPersonalDeliveryPostalCode(postalCode: string | null | undefined): boolean {
  const normalized = normalizePostalCode(postalCode);
  if (normalized.length < 5) return false;
  return PERSONAL_DELIVERY_POSTAL_CODES.has(normalized);
}

export function resolveCustomerPersonalDeliveryEligible(
  customer: Parameters<typeof resolveCustomerPostalCode>[0],
): boolean {
  return isPersonalDeliveryPostalCode(resolveCustomerPostalCode(customer));
}
