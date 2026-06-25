import type { ProductMediaItem, PortalFeaturedProduct, PortalStoreProduct } from "@emperatriz/types";

export function productGalleryMedia(
  product: Pick<PortalFeaturedProduct | PortalStoreProduct, "mediaItems" | "imageUrls">,
): ProductMediaItem[] {
  if (product.mediaItems?.length) return product.mediaItems;
  return product.imageUrls.map((url) => ({ url, kind: "image" as const }));
}
