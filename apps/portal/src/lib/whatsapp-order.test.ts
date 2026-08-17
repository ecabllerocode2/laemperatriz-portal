import { describe, expect, it } from "vitest";
import {
  CATALOG_WHATSAPP_PHONE,
  catalogProductWhatsAppMessage,
  catalogWhatsAppUrl,
} from "./whatsapp-order";

describe("catalogWhatsAppUrl", () => {
  it("builds a wa.me link with the catalog number", () => {
    expect(catalogWhatsAppUrl()).toBe(`https://wa.me/52${CATALOG_WHATSAPP_PHONE}`);
  });

  it("includes the encoded product message", () => {
    const message = catalogProductWhatsAppMessage({
      productName: "Anillo sol",
      sku: "EMP-ANI-0001",
      variantLabel: "Dorado · Talla 6",
    });

    expect(catalogWhatsAppUrl(message)).toBe(
      `https://wa.me/52${CATALOG_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`,
    );
    expect(message).toContain("Anillo sol");
    expect(message).toContain("EMP-ANI-0001");
    expect(message).toContain("Dorado · Talla 6");
  });
});
