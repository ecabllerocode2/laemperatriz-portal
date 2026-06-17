import type { ProductVariant } from "@emperatriz/types";
import {
  formatVariantLabel,
  VARIANT_NOT_APPLICABLE,
  variantsNeedSelection,
} from "@/lib/product-variants";

interface VariantPickerProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
  disabled?: boolean;
}

export default function VariantPicker({
  variants,
  selectedVariantId,
  onSelect,
  disabled = false,
}: VariantPickerProps) {
  const available = variants.filter((variant) => variant.stock > 0);
  if (!variantsNeedSelection(variants)) return null;

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-brand-night">
        Elige variante (color y talla)
      </span>
      <div className="flex flex-wrap gap-2">
        {available.map((variant) => {
          const label =
            formatVariantLabel(variant) ??
            `${variant.color}${variant.size !== VARIANT_NOT_APPLICABLE ? ` · ${variant.size}` : ""}`;
          const selected = selectedVariantId === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(variant.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                selected
                  ? "bg-brand-red text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {label} ({variant.stock})
            </button>
          );
        })}
      </div>
    </div>
  );
}
