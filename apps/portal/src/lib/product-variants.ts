import type { PortalProductVariant } from "@emperatriz/types";

export const VARIANT_NOT_APPLICABLE = "No aplica";
export const DEFAULT_VARIANT_ID = "default";

export function normalizeProductVariants(
  product: Pick<{ stock: number; variants?: PortalProductVariant[] }, "stock" | "variants">,
): PortalProductVariant[] {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }
  return [
    {
      id: DEFAULT_VARIANT_ID,
      color: VARIANT_NOT_APPLICABLE,
      size: VARIANT_NOT_APPLICABLE,
      stock: product.stock ?? 0,
      imageUrl: null,
      mediaItems: [],
    },
  ];
}

export function variantsAvailableForSale(variants: PortalProductVariant[]): PortalProductVariant[] {
  return variants.filter((variant) => variant.stock > 0);
}

export function variantsNeedSelection(variants: PortalProductVariant[]): boolean {
  return variantsAvailableForSale(variants).length > 1;
}

export function formatVariantLabel(variant: Pick<PortalProductVariant, "color" | "size">): string | null {
  const parts: string[] = [];
  if (variant.color && variant.color !== VARIANT_NOT_APPLICABLE) parts.push(variant.color);
  if (variant.size && variant.size !== VARIANT_NOT_APPLICABLE) parts.push(`Talla ${variant.size}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function formatVariantDisplayLabel(
  variant: Pick<PortalProductVariant, "color" | "size">,
  index = 0,
): string {
  return formatVariantLabel(variant) ?? `Variante ${index + 1}`;
}

export function resolveAutoVariantId(variants: PortalProductVariant[]): string | null {
  const available = variantsAvailableForSale(variants);
  if (available.length !== 1) return null;
  return available[0]!.id;
}

/** Variante a enviar al confirmar: selección manual o auto si solo hay una. */
export function resolveConfirmVariantId(
  variants: PortalProductVariant[],
  selectedVariantId: string | null,
): string | null {
  const available = variantsAvailableForSale(variants);
  if (selectedVariantId && available.some((variant) => variant.id === selectedVariantId)) {
    return selectedVariantId;
  }
  return resolveAutoVariantId(variants);
}

export function resolveActiveVariant(
  variants: PortalProductVariant[],
  selectedVariantId: string | null,
): PortalProductVariant | null {
  const available = variantsAvailableForSale(variants);
  if (selectedVariantId) {
    return available.find((variant) => variant.id === selectedVariantId) ?? null;
  }
  if (available.length === 1) return available[0]!;
  return available[0] ?? null;
}
