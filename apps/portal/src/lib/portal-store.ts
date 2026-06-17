import type {
  Category,
  PortalStoreProduct,
  PortalStoreProductsResponse,
  PortalLiveOrderResult,
} from "@emperatriz/types";
import { apiRequest } from "@/lib/api";

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
    shownAt: null,
    saleChannel: product.saleChannel,
    earlyPayDiscountPercent: product.earlyPayDiscountPercent,
    ...(product.variants ? { variants: product.variants } : {}),
  };
}
