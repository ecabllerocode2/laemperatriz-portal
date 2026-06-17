import { describe, expect, it } from "vitest";
import {
  livePurchaseBlockMessage,
  resolveLivePurchaseBlockKind,
} from "./live-purchase-block";

describe("resolveLivePurchaseBlockKind", () => {
  it("permite comprar cuando canPurchase es true", () => {
    expect(
      resolveLivePurchaseBlockKind({ canPurchase: true, blockReason: "threshold_block" }),
    ).toBe("none");
  });

  it("distingue umbral de apertura de carrito", () => {
    expect(
      resolveLivePurchaseBlockKind({ canPurchase: false, blockReason: "threshold_block" }),
    ).toBe("threshold");
    expect(
      resolveLivePurchaseBlockKind({ canPurchase: false, blockReason: "cart_opening_required" }),
    ).toBe("cart_opening");
    expect(
      resolveLivePurchaseBlockKind({ canPurchase: false, blockReason: "cart_pending_review" }),
    ).toBe("pending_review");
  });
});

describe("livePurchaseBlockMessage", () => {
  it("muestra monto de umbral", () => {
    const message = livePurchaseBlockMessage("threshold_block", {
      orderedTotal: 2900,
      depositDue: 800,
    });
    expect(message).toContain("2,900");
    expect(message).toContain("800");
  });

  it("avisa comprobante en revisión", () => {
    expect(livePurchaseBlockMessage("cart_pending_review")).toMatch(/revisión/i);
  });
});
