import type { PortalBlockReason } from "@emperatriz/types";

export type LivePurchaseBlockKind =
  | "none"
  | "cart_opening"
  | "threshold"
  | "pending_review";

export function resolveLivePurchaseBlockKind(input: {
  canPurchase: boolean;
  blockReason: PortalBlockReason;
}): LivePurchaseBlockKind {
  if (input.canPurchase) return "none";
  if (input.blockReason === "cart_pending_review") return "pending_review";
  if (input.blockReason === "threshold_block") return "threshold";
  return "cart_opening";
}

export function livePurchaseBlockMessage(
  blockReason: PortalBlockReason,
  threshold?: { orderedTotal: number; depositDue: number },
): string | null {
  switch (blockReason) {
    case "cart_pending_review":
      return "Tu comprobante está en revisión. Te avisaremos cuando puedas apartar.";
    case "threshold_block":
      if (threshold && threshold.depositDue > 0) {
        return `Has pedido ${threshold.orderedTotal.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}. Liquida ${threshold.depositDue.toLocaleString("es-MX", { style: "currency", currency: "MXN" })} para seguir apartando.`;
      }
      return "Liquida el saldo pendiente de tu ciclo para seguir apartando.";
    case "cycle_completed":
      return "Tu ciclo terminó. Abre un nuevo carrito con $200 para seguir comprando.";
    case "cycle_closed":
      return "Tu ciclo anterior cerró. Activa un carrito nuevo para apartar en el live.";
    case "cart_opening_required":
      return "Para apartar piezas, activa tu carrito con el depósito de $200.";
    default:
      return null;
  }
}
