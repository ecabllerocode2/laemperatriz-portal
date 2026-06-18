import type { PortalPrivateToast } from "@emperatriz/types";
import type { DepositStatus } from "@/types/portal-profile";

const STORAGE_KEY = "portal-seen-toast-ids";

function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function markPortalToastSeen(id: string): void {
  const seen = getSeenIds();
  seen.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen].slice(-50)));
}

export function shouldShowPortalToast(
  toast: PortalPrivateToast,
  ctx: { depositStatus: DepositStatus; canPurchase: boolean },
): boolean {
  if (getSeenIds().has(toast.id)) return false;

  if (toast.type === "cart_approved" || toast.type === "can_purchase") {
    if (ctx.depositStatus === "approved") return false;
    if (!ctx.canPurchase) return false;
  }

  return true;
}
