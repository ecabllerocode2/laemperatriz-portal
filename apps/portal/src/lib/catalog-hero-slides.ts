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

export function resolveProductCoverImage(
  product: Pick<PortalStoreProduct, "imageUrl" | "imageUrls" | "mediaItems">,
): string | null {
  if (product.imageUrl) return product.imageUrl;
  if (product.imageUrls.length > 0) return product.imageUrls[0] ?? null;

  const firstImage = product.mediaItems?.find(
    (item) => item.kind === "image" || !/\.(mp4|webm)(\?.*)?$/i.test(item.url),
  );
  return firstImage?.url ?? product.mediaItems?.[0]?.url ?? null;
}

export function buildCatalogHeroSlides(products: PortalStoreProduct[]): CatalogHeroSlide[] {
  const byCategory = new Map<string, PortalStoreProduct[]>();

  for (const product of products) {
    if (product.stock < 1 || !resolveProductCoverImage(product)) continue;
    const list = byCategory.get(product.categoryId) ?? [];
    list.push(product);
    byCategory.set(product.categoryId, list);
  }

  const slides: CatalogHeroSlide[] = [];

  for (const [categoryId, categoryProducts] of byCategory) {
    const pick = pickRandom(categoryProducts);
    if (!pick) continue;
    const imageUrl = resolveProductCoverImage(pick);
    if (!imageUrl) continue;
    slides.push({
      imageUrl,
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
