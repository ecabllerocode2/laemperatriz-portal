import { describe, expect, it } from "vitest";
import type { PortalStoreProduct } from "@emperatriz/types";
import { buildCatalogHeroSlides, pickNextHeroSlideIndex } from "./catalog-hero-slides";

function product(
  partial: Partial<PortalStoreProduct> & Pick<PortalStoreProduct, "productId" | "categoryId">,
): PortalStoreProduct {
  return {
    name: "Producto",
    sku: "SKU-1",
    price: 100,
    stock: 1,
    imageUrl: null,
    imageUrls: [],
    saleChannel: "whatsapp",
    earlyPayDiscountPercent: 0,
    channelEarlyPayPercent: 0,
    ...partial,
  };
}

describe("buildCatalogHeroSlides", () => {
  it("picks one slide per category with image", () => {
    const slides = buildCatalogHeroSlides([
      product({ productId: "a1", categoryId: "cat-a", imageUrl: "https://img/a1.jpg", name: "A1" }),
      product({ productId: "a2", categoryId: "cat-a", imageUrl: "https://img/a2.jpg", name: "A2" }),
      product({ productId: "b1", categoryId: "cat-b", imageUrl: "https://img/b1.jpg", name: "B1" }),
      product({ productId: "c1", categoryId: "cat-c", imageUrl: null, name: "Sin foto" }),
    ]);

    expect(slides).toHaveLength(2);
    expect(new Set(slides.map((slide) => slide.categoryId))).toEqual(new Set(["cat-a", "cat-b"]));
  });
});

describe("pickNextHeroSlideIndex", () => {
  const slides = [
    { imageUrl: "1", imageAlt: "1", categoryId: "a" },
    { imageUrl: "2", imageAlt: "2", categoryId: "b" },
    { imageUrl: "3", imageAlt: "3", categoryId: "c" },
  ];

  it("returns a different index when possible", () => {
    const next = pickNextHeroSlideIndex(slides, 1);
    expect(next).not.toBe(1);
    expect(next).toBeGreaterThanOrEqual(0);
    expect(next).toBeLessThan(slides.length);
  });
});
