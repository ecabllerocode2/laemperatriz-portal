import type { ProductVariant } from "@emperatriz/types";

export const VARIANT_NOT_APPLICABLE = "No aplica";

export function normalizeProductVariants(
  product: Pick<{ stock: number; variants?: ProductVariant[] }, "stock" | "variants">,
): ProductVariant[] {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }
  return [
    {
      id: "default",
      color: VARIANT_NOT_APPLICABLE,
      size: VARIANT_NOT_APPLICABLE,
      stock: product.stock ?? 0,
    },
  ];
}

export function variantsAvailableForSale(variants: ProductVariant[]): ProductVariant[] {
  return variants.filter((variant) => variant.stock > 0);
}

export function variantsNeedSelection(variants: ProductVariant[]): boolean {
  return variantsAvailableForSale(variants).length > 1;
}

export function formatVariantLabel(variant: Pick<ProductVariant, "color" | "size">): string | null {
  const parts: string[] = [];
  if (variant.color && variant.color !== VARIANT_NOT_APPLICABLE) parts.push(variant.color);
  if (variant.size && variant.size !== VARIANT_NOT_APPLICABLE) parts.push(`Talla ${variant.size}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function resolveAutoVariantId(variants: ProductVariant[]): string | null {
  const available = variantsAvailableForSale(variants);
  if (available.length !== 1) return null;
  return available[0]!.id;
}

/** Variante a enviar al confirmar: selección manual o auto si solo hay una. */
export function resolveConfirmVariantId(
  variants: ProductVariant[],
  selectedVariantId: string | null,
): string | null {
  const available = variantsAvailableForSale(variants);
  if (selectedVariantId && available.some((variant) => variant.id === selectedVariantId)) {
    return selectedVariantId;
  }
  return resolveAutoVariantId(variants);
}
