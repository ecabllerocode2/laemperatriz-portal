import type {
  ProductMediaItem,
  ProductMediaKind,
  PortalFeaturedProduct,
  PortalStoreProduct,
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
