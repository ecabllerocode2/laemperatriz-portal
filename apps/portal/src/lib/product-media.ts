import type {
  PortalFeaturedProduct,
  PortalProductVariant,
  PortalStoreProduct,
  ProductMediaItem,
  ProductMediaKind,
} from "@emperatriz/types";

const VIDEO_URL_PATTERN = /\.(mp4|webm)(\?.*)?$/i;

export function inferMediaKind(url: string, kind?: ProductMediaKind): ProductMediaKind {
  if (kind === "video" || kind === "image") return kind;
  return VIDEO_URL_PATTERN.test(url) ? "video" : "image";
}

export function productGalleryMedia(
  product: Pick<PortalFeaturedProduct | PortalStoreProduct, "mediaItems" | "imageUrls" | "imageUrl">,
): ProductMediaItem[] {
  if (product.mediaItems?.length) {
    return product.mediaItems.map((item) => ({
      url: item.url,
      kind: inferMediaKind(item.url, item.kind),
    }));
  }

  const urls =
    product.imageUrls.length > 0
      ? product.imageUrls
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  return urls.map((url) => ({
    url,
    kind: inferMediaKind(url),
  }));
}

export function variantGalleryMedia(
  variant: Pick<PortalProductVariant, "mediaItems" | "imageUrl"> | null | undefined,
  product: Pick<PortalFeaturedProduct | PortalStoreProduct, "mediaItems" | "imageUrls" | "imageUrl">,
): ProductMediaItem[] {
  if (variant?.mediaItems?.length) {
    return variant.mediaItems.map((item) => ({
      url: item.url,
      kind: inferMediaKind(item.url, item.kind),
    }));
  }

  if (variant?.imageUrl) {
    return [{ url: variant.imageUrl, kind: inferMediaKind(variant.imageUrl) }];
  }

  return productGalleryMedia(product);
}

export function variantCoverImageUrl(
  variant: Pick<PortalProductVariant, "mediaItems" | "imageUrl"> | null | undefined,
  product: Pick<PortalFeaturedProduct | PortalStoreProduct, "imageUrl">,
): string | null {
  if (variant?.imageUrl) return variant.imageUrl;
  const firstImage = variant?.mediaItems?.find((item) => inferMediaKind(item.url, item.kind) === "image");
  if (firstImage) return firstImage.url;
  return product.imageUrl;
}
