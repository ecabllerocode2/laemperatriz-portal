import type { PortalStoreProduct } from "@emperatriz/types";

export interface CatalogHeroSlide {
  imageUrl: string;
  imageAlt: string;
  categoryId: string;
}

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

export function buildCatalogHeroSlides(products: PortalStoreProduct[]): CatalogHeroSlide[] {
  const byCategory = new Map<string, PortalStoreProduct[]>();

  for (const product of products) {
    if (!product.imageUrl || product.stock < 1) continue;
    const list = byCategory.get(product.categoryId) ?? [];
    list.push(product);
    byCategory.set(product.categoryId, list);
  }

  const slides: CatalogHeroSlide[] = [];

  for (const [categoryId, categoryProducts] of byCategory) {
    const pick = pickRandom(categoryProducts);
    if (!pick?.imageUrl) continue;
    slides.push({
      imageUrl: pick.imageUrl,
      imageAlt: pick.name,
      categoryId,
    });
  }

  return slides;
}

export function pickNextHeroSlideIndex(slides: CatalogHeroSlide[], currentIndex: number): number {
  if (slides.length <= 1) return 0;

  let next = currentIndex;
  let attempts = 0;

  while (next === currentIndex && attempts < 8) {
    next = Math.floor(Math.random() * slides.length);
    attempts += 1;
  }

  return next === currentIndex ? (currentIndex + 1) % slides.length : next;
}
