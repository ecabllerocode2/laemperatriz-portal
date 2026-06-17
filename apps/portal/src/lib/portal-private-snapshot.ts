import type {
  PaymentConcept,
  PortalBlockReason,
  PortalPrivateSnapshot,
  PortalPrivateToast,
} from "@emperatriz/types";

function parseToast(raw: unknown): PortalPrivateToast | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = typeof row["id"] === "string" ? row["id"] : "";
  if (!id) return null;

  const type = row["type"];
  if (
    type !== "cart_approved" &&
    type !== "payment_rejected" &&
    type !== "cycle_completed" &&
    type !== "can_purchase"
  ) {
    return null;
  }

  return {
    id,
    type,
    message: typeof row["message"] === "string" ? row["message"] : "",
    dismissible: row["dismissible"] === true,
  };
}

function parseBlockReason(raw: unknown): PortalBlockReason {
  if (
    raw === "cart_opening_required" ||
    raw === "cart_pending_review" ||
    raw === "cycle_completed" ||
    raw === "cycle_closed" ||
    raw === "threshold_block"
  ) {
    return raw;
  }
  return null;
}

function parseThresholdBlock(raw: unknown): PortalPrivateSnapshot["thresholdBlock"] {
  if (!raw || typeof raw !== "object") {
    return {
      active: false,
      orderedTotal: 0,
      paidTotal: 0,
      requiredPaid: 0,
      depositDue: 0,
    };
  }
  const row = raw as Record<string, unknown>;
  return {
    active: row["active"] === true,
    orderedTotal: typeof row["orderedTotal"] === "number" ? row["orderedTotal"] : 0,
    paidTotal: typeof row["paidTotal"] === "number" ? row["paidTotal"] : 0,
    requiredPaid: typeof row["requiredPaid"] === "number" ? row["requiredPaid"] : 0,
    depositDue: typeof row["depositDue"] === "number" ? row["depositDue"] : 0,
  };
}

function parsePendingPayment(
  raw: unknown,
): PortalPrivateSnapshot["pendingPayment"] {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const concept = row["concept"];
  if (
    concept !== "cart_opening" &&
    concept !== "note_payment" &&
    concept !== "shipping_payment"
  ) {
    return null;
  }

  const status = row["status"];
  if (status !== "pending" && status !== "approved" && status !== "rejected") {
    return null;
  }

  return {
    concept: concept as PaymentConcept,
    amount: typeof row["amount"] === "number" ? row["amount"] : 0,
    status,
  };
}

export function parsePortalPrivateSnapshot(raw: unknown): PortalPrivateSnapshot | null {
  if (!raw || typeof raw !== "object") return null;

  const row = raw as Record<string, unknown>;
  const depositStatus = row["depositStatus"];

  return {
    depositStatus:
      depositStatus === "pending" || depositStatus === "approved" || depositStatus === "none"
        ? depositStatus
        : "none",
    cycleId: typeof row["cycleId"] === "string" ? row["cycleId"] : null,
    cycleStatus: typeof row["cycleStatus"] === "string" ? row["cycleStatus"] : null,
    canPurchase: row["canPurchase"] === true,
    blockReason: parseBlockReason(row["blockReason"]),
    cartOpeningRequired: row["cartOpeningRequired"] === true,
    pendingPayment: parsePendingPayment(row["pendingPayment"]),
    thresholdBlock: parseThresholdBlock(row["thresholdBlock"]),
    toast: parseToast(row["toast"]),
    version: typeof row["version"] === "number" ? row["version"] : 0,
    updatedAt: typeof row["updatedAt"] === "number" ? row["updatedAt"] : Date.now(),
  };
}

export const PORTAL_PRIVATE_RTD_PATH = (uid: string) => `portalPrivate/${uid}`;
