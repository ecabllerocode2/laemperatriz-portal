import type { PortalLiveOrderResult, PortalLiveResponse } from "@emperatriz/types";
import { apiRequest } from "@/lib/api";

export async function fetchPortalLive(): Promise<PortalLiveResponse> {
  return apiRequest<PortalLiveResponse>("/api/portal/live");
}

export async function createPortalLiveOrder(input: {
  productId: string;
  quantity: number;
  liveSessionId?: string;
}): Promise<PortalLiveOrderResult> {
  return apiRequest<PortalLiveOrderResult>("/api/portal/live/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
