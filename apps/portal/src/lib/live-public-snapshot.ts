import type { LivePublicSnapshot, PortalFeaturedProduct, PortalLiveSession, ProductVariant } from "@emperatriz/types";

function parseVariants(raw: unknown): ProductVariant[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const variants = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id = typeof row["id"] === "string" ? row["id"] : "";
      if (!id) return null;
      return {
        id,
        color: typeof row["color"] === "string" ? row["color"] : "No aplica",
        size: typeof row["size"] === "string" ? row["size"] : "No aplica",
        stock: typeof row["stock"] === "number" ? row["stock"] : 0,
      } satisfies ProductVariant;
    })
    .filter((item): item is ProductVariant => item !== null);
  return variants.length > 0 ? variants : undefined;
}

function parseFeaturedProduct(raw: unknown): PortalFeaturedProduct | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const productId = typeof row["productId"] === "string" ? row["productId"] : "";
  if (!productId) return null;

  const parsedVariants = parseVariants(row["variants"]);

  return {
    productId,
    name: typeof row["name"] === "string" ? row["name"] : "",
    price: typeof row["price"] === "number" ? row["price"] : 0,
    stock: typeof row["stock"] === "number" ? row["stock"] : 0,
    imageUrl: typeof row["imageUrl"] === "string" ? row["imageUrl"] : null,
    imageUrls: Array.isArray(row["imageUrls"])
      ? row["imageUrls"].filter((item): item is string => typeof item === "string")
      : [],
    shownAt: typeof row["shownAt"] === "string" ? row["shownAt"] : null,
    saleChannel:
      row["saleChannel"] === "whatsapp" ||
      row["saleChannel"] === "facebook" ||
      row["saleChannel"] === "no_discount"
        ? row["saleChannel"]
        : "no_discount",
    earlyPayDiscountPercent:
      typeof row["earlyPayDiscountPercent"] === "number" ? row["earlyPayDiscountPercent"] : 0,
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
