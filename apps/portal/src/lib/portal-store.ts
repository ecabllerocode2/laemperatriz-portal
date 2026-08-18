import type {
  Category,
  PortalStoreProduct,
  PortalStoreProductsResponse,
  PortalLiveOrderResult,
} from "@emperatriz/types";
import { apiRequest } from "@/lib/api";
import {
  type CatalogHeroSlide,
  resolveProductCoverImage,
} from "@/lib/catalog-hero-slides";

export interface StoreProductsQuery {
  limit?: number;
  cursor?: string;
  search?: string;
  categoryId?: string;
}

export async function fetchStoreProducts(
  query: StoreProductsQuery = {},
): Promise<PortalStoreProductsResponse> {
  const params = new URLSearchParams();
  if (query.limit) params.set("limit", String(query.limit));
  if (query.cursor) params.set("cursor", query.cursor);
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.categoryId) params.set("categoryId", query.categoryId);

  const qs = params.toString();
  return apiRequest<PortalStoreProductsResponse>(
    `/api/portal/store/products${qs ? `?${qs}` : ""}`,
  );
}

export async function fetchStoreProduct(productId: string): Promise<PortalStoreProduct> {
  return apiRequest<PortalStoreProduct>(`/api/portal/store/products/${productId}`);
}

export async function fetchStoreCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/api/portal/store/categories");
}

function pickRandomProduct<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

export async function fetchCatalogHeroSlides(
  categories: Pick<Category, "id">[],
): Promise<CatalogHeroSlide[]> {
  const slides = await Promise.all(
    categories.map(async (category) => {
      try {
        const response = await fetchStoreProducts({ categoryId: category.id, limit: 12 });
        const withImage = response.products.filter(
          (product) => product.stock > 0 && resolveProductCoverImage(product),
        );
        const pick = pickRandomProduct(withImage) ?? withImage[0];
        if (!pick) return null;

        const imageUrl = resolveProductCoverImage(pick);
        if (!imageUrl) return null;

        return {
          imageUrl,
          imageAlt: pick.name,
          categoryId: category.id,
        };
      } catch {
        return null;
      }
    }),
  );

  return slides.filter((slide): slide is CatalogHeroSlide => slide !== null);
}

export async function createPortalStoreOrder(input: {
  productId: string;
  quantity: number;
  variantId?: string;
  variantColor?: string;
  variantSize?: string;
}): Promise<PortalLiveOrderResult> {
  return apiRequest<PortalLiveOrderResult>("/api/portal/store/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function storeProductToFeatured(product: PortalStoreProduct) {
  return {
    productId: product.productId,
    name: product.name,
    price: product.price,
    stock: product.stock,
    imageUrl: product.imageUrl,
    imageUrls: product.imageUrls,
    ...(product.mediaItems ? { mediaItems: product.mediaItems } : {}),
    shownAt: null,
    saleChannel: product.saleChannel,
    earlyPayDiscountPercent: product.earlyPayDiscountPercent,
    channelEarlyPayPercent: product.channelEarlyPayPercent,
    ...(product.variants ? { variants: product.variants } : {}),
  };
}
