import { describe, expect, it } from "vitest";
import { isStoreProductNew, STORE_PRODUCT_NEW_WINDOW_MS } from "./store-product-new";

describe("isStoreProductNew", () => {
  const now = Date.parse("2026-08-18T12:00:00.000Z");

  it("marca como nuevo si se listó hace menos de 7 días", () => {
    const sixDaysAgo = new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString();
    expect(isStoreProductNew(sixDaysAgo, now)).toBe(true);
  });

  it("deja de ser nuevo justo después de la ventana de 7 días", () => {
    const justOverSevenDays = new Date(now - STORE_PRODUCT_NEW_WINDOW_MS - 1).toISOString();
    expect(isStoreProductNew(justOverSevenDays, now)).toBe(false);
  });

  it("sigue siendo nuevo en el límite exacto de 7 días", () => {
    const exactlySevenDays = new Date(now - STORE_PRODUCT_NEW_WINDOW_MS).toISOString();
    expect(isStoreProductNew(exactlySevenDays, now)).toBe(true);
  });

  it("no marca como nuevo sin fecha de listado", () => {
    expect(isStoreProductNew(undefined, now)).toBe(false);
  });
});
