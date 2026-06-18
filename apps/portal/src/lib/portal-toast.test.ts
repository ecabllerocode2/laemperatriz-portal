import { beforeEach, describe, expect, it, vi } from "vitest";
import { markPortalToastSeen, shouldShowPortalToast } from "@/lib/portal-toast";

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => [...store.keys()][index] ?? null,
    removeItem: (key) => void store.delete(key),
    setItem: (key, value) => void store.set(key, value),
  };
}

describe("shouldShowPortalToast", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createStorage());
  });

  it("hides cart_approved when deposit is already approved", () => {
    const toast = {
      id: "t1",
      type: "cart_approved" as const,
      message: "¡Tu carrito ya está activo!",
      dismissible: true,
    };
    expect(
      shouldShowPortalToast(toast, { depositStatus: "approved", canPurchase: false }),
    ).toBe(false);
  });

  it("hides success toast when purchase is blocked by threshold", () => {
    const toast = {
      id: "t2",
      type: "can_purchase" as const,
      message: "Ya puedes apartar",
      dismissible: true,
    };
    expect(
      shouldShowPortalToast(toast, { depositStatus: "approved", canPurchase: false }),
    ).toBe(false);
  });

  it("does not repeat a toast the user already saw", () => {
    const toast = {
      id: "t3",
      type: "payment_rejected" as const,
      message: "Rechazado",
      dismissible: true,
    };
    markPortalToastSeen("t3");
    expect(
      shouldShowPortalToast(toast, { depositStatus: "approved", canPurchase: true }),
    ).toBe(false);
  });
});
