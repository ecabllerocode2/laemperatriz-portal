import { X } from "lucide-react";
import type { PortalBlockReason, PortalPrivateToast } from "@emperatriz/types";
import { livePurchaseBlockMessage } from "@/lib/live-purchase-block";

interface LivePurchaseGateProps {
  canPurchase: boolean;
  blockReason: PortalBlockReason;
  thresholdBlock?: {
    orderedTotal: number;
    depositDue: number;
  } | null;
  toast: PortalPrivateToast | null;
  dismissedToastId: string | null;
  onDismissToast: () => void;
  onActivateCart: () => void;
  onPayThreshold?: () => void;
  variant?: "overlay" | "inline";
}

export default function LivePurchaseGate({
  canPurchase,
  blockReason,
  thresholdBlock,
  toast,
  dismissedToastId,
  onDismissToast,
  onActivateCart,
  onPayThreshold,
  variant = "overlay",
}: LivePurchaseGateProps) {
  const showToast = toast && toast.id !== dismissedToastId;
  const bannerText = livePurchaseBlockMessage(blockReason, thresholdBlock ?? undefined);

  if (canPurchase && !showToast) return null;

  const payAction =
    blockReason === "threshold_block" ? onPayThreshold ?? onActivateCart : onActivateCart;
  const payLabel = blockReason === "threshold_block" ? "Subir comprobante" : "Activar carrito";

  const banner = !canPurchase && bannerText ? (
    <div
      className={
        variant === "overlay"
          ? "rounded-xl border border-amber-300/40 bg-amber-500/20 px-3 py-2 text-center text-xs text-amber-50 backdrop-blur-sm"
          : "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      }
    >
      {bannerText}{" "}
      {blockReason === "cart_opening_required" ||
      blockReason === "cycle_completed" ||
      blockReason === "cycle_closed" ||
      blockReason === "threshold_block" ? (
        <button
          type="button"
          onClick={payAction}
          className="font-semibold underline underline-offset-2"
        >
          {payLabel}
        </button>
      ) : null}
    </div>
  ) : null;

  const toastBanner = showToast ? (
    <div
      className={
        variant === "overlay"
          ? "flex items-start gap-2 rounded-xl border border-emerald-300/40 bg-emerald-600/25 px-3 py-2 text-xs text-emerald-50 backdrop-blur-sm"
          : "flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
      }
      role="status"
    >
      <p className="min-w-0 flex-1">{toast!.message}</p>
      {toast!.dismissible ? (
        <button
          type="button"
          onClick={onDismissToast}
          className="shrink-0 rounded-full p-0.5 opacity-80 hover:opacity-100"
          aria-label="Cerrar aviso"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  ) : null;

  if (variant === "overlay") {
    return (
      <div className="absolute inset-x-3 top-[calc(4.25rem+env(safe-area-inset-top))] z-30 space-y-2">
        {toastBanner}
        {banner}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {toastBanner}
      {banner}
    </div>
  );
}
