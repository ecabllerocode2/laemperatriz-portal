import type { PortalCycle } from "@emperatriz/types";
import { apiRequest } from "@/lib/api";

export interface ShippingAddressDetail {
  postalCode: string;
  state: string;
  municipality: string;
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string;
}

export interface PortalCycleResponse {
  cycle: PortalCycle | null;
  needsShippingAddress: boolean;
  shippingAddress: string | null;
  shippingAddressDetail?: ShippingAddressDetail | null;
}

const EMPTY_CYCLE_RESPONSE: PortalCycleResponse = {
  cycle: null,
  needsShippingAddress: false,
  shippingAddress: null,
};

export async function fetchPortalCycle(): Promise<PortalCycleResponse> {
  const data = await apiRequest<PortalCycleResponse | null>("/api/portal/cycle");
  return data ?? EMPTY_CYCLE_RESPONSE;
}

export async function saveShippingAddress(
  address: ShippingAddressDetail,
): Promise<{ shippingAddress: string }> {
  return apiRequest<{ shippingAddress: string }>("/api/portal/shipping-address", {
    method: "POST",
    body: JSON.stringify(address),
  });
}

export async function acceptPenalty(): Promise<{ status: string }> {
  return apiRequest<{ status: string }>("/api/portal/cycle/penalty/accept", {
    method: "POST",
    body: "{}",
  });
}

export async function rejectPenalty(): Promise<{ status: string }> {
  return apiRequest<{ status: string }>("/api/portal/cycle/penalty/reject", {
    method: "POST",
    body: "{}",
  });
}
