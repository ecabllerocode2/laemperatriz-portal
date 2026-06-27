import type {
  LivePublicSnapshot,
  PortalFeaturedProduct,
  PortalLiveSession,
  PortalProductVariant,
  ProductMediaItem,
} from "@emperatriz/types";

function parseVariantMedia(raw: unknown): ProductMediaItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const url = typeof row["url"] === "string" ? row["url"] : "";
      if (!url) return null;
      const kind = row["kind"] === "video" ? "video" : "image";
      return { url, kind } satisfies ProductMediaItem;
    })
    .filter((item): item is ProductMediaItem => item !== null);
}

function parseVariants(raw: unknown): PortalProductVariant[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const variants = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id = typeof row["id"] === "string" ? row["id"] : "";
      if (!id) return null;
      const mediaItems = parseVariantMedia(row["mediaItems"]);
      const imageUrl =
        typeof row["imageUrl"] === "string"
          ? row["imageUrl"]
          : mediaItems.find((media) => media.kind === "image")?.url ??
            mediaItems[0]?.url ??
            null;
      return {
        id,
        color: typeof row["color"] === "string" ? row["color"] : "No aplica",
        size: typeof row["size"] === "string" ? row["size"] : "No aplica",
        stock: typeof row["stock"] === "number" ? row["stock"] : 0,
        imageUrl,
        mediaItems,
      } satisfies PortalProductVariant;
    })
    .filter((item): item is PortalProductVariant => item !== null);
  return variants.length > 0 ? variants : undefined;
}

function parseMediaItems(raw: unknown): ProductMediaItem[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const url = typeof row["url"] === "string" ? row["url"] : "";
      if (!url) return null;
      const kind = row["kind"] === "video" ? "video" : "image";
      return { url, kind } satisfies ProductMediaItem;
    })
    .filter((item): item is ProductMediaItem => item !== null);
  return items.length > 0 ? items : undefined;
}

function parseFeaturedProduct(raw: unknown): PortalFeaturedProduct | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const productId = typeof row["productId"] === "string" ? row["productId"] : "";
  if (!productId) return null;

  const parsedVariants = parseVariants(row["variants"]);

  const parsedMedia = parseMediaItems(row["mediaItems"]);

  return {
    productId,
    name: typeof row["name"] === "string" ? row["name"] : "",
    price: typeof row["price"] === "number" ? row["price"] : 0,
    stock: typeof row["stock"] === "number" ? row["stock"] : 0,
    imageUrl: typeof row["imageUrl"] === "string" ? row["imageUrl"] : null,
    imageUrls: Array.isArray(row["imageUrls"])
      ? row["imageUrls"].filter((item): item is string => typeof item === "string")
      : [],
    ...(parsedMedia ? { mediaItems: parsedMedia } : {}),
    shownAt: typeof row["shownAt"] === "string" ? row["shownAt"] : null,
    saleChannel:
      row["saleChannel"] === "whatsapp" ||
      row["saleChannel"] === "facebook" ||
      row["saleChannel"] === "no_discount"
        ? row["saleChannel"]
        : "no_discount",
    earlyPayDiscountPercent:
      typeof row["earlyPayDiscountPercent"] === "number" ? row["earlyPayDiscountPercent"] : 0,
    channelEarlyPayPercent:
      typeof row["channelEarlyPayPercent"] === "number"
        ? row["channelEarlyPayPercent"]
        : row["saleChannel"] === "whatsapp" || row["saleChannel"] === "facebook"
          ? 10
          : 0,
    ...(parsedVariants ? { variants: parsedVariants } : {}),
  };
}

export function parseLivePublicSnapshot(raw: unknown): LivePublicSnapshot | null {
  if (!raw || typeof raw !== "object") return null;

  const row = raw as Record<string, unknown>;
  const sessionId = typeof row["sessionId"] === "string" ? row["sessionId"] : "";
  if (!sessionId) return null;

  const featuredHistory = Array.isArray(row["featuredHistory"])
    ? row["featuredHistory"]
        .map((item) => parseFeaturedProduct(item))
        .filter((item): item is PortalFeaturedProduct => item !== null)
    : [];

  return {
    sessionId,
    name: typeof row["name"] === "string" ? row["name"] : "Live",
    startedAt: typeof row["startedAt"] === "string" ? row["startedAt"] : null,
    facebookVideoUrl:
      typeof row["facebookVideoUrl"] === "string" ? row["facebookVideoUrl"] : null,
    embedUrl: typeof row["embedUrl"] === "string" ? row["embedUrl"] : null,
    featuredProduct: parseFeaturedProduct(row["featuredProduct"]),
    featuredHistory,
    version: typeof row["version"] === "number" ? row["version"] : 0,
    updatedAt: typeof row["updatedAt"] === "number" ? row["updatedAt"] : Date.now(),
  };
}

export function livePublicSnapshotToPortalSession(
  snapshot: LivePublicSnapshot,
): PortalLiveSession {
  return {
    id: snapshot.sessionId,
    name: snapshot.name,
    startedAt: snapshot.startedAt,
    facebookVideoUrl: snapshot.facebookVideoUrl,
    embedUrl: snapshot.embedUrl,
    featuredProduct: snapshot.featuredProduct,
    featuredHistory: snapshot.featuredHistory,
  };
}

export const LIVE_PUBLIC_RTD_PATH = "livePublic/current";
