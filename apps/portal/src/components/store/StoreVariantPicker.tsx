import type { PortalProductVariant } from "@emperatriz/types";
import {
  formatVariantDisplayLabel,
  resolveVariantSku,
  variantsAvailableForSale,
  variantsNeedSelection,
} from "@/lib/product-variants";

interface StoreVariantPickerProps {
  variants: PortalProductVariant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
  productSku: string;
}

export default function StoreVariantPicker({
  variants,
  selectedVariantId,
  onSelect,
  productSku,
}: StoreVariantPickerProps) {
  const available = variantsAvailableForSale(variants);
  if (!variantsNeedSelection(variants)) return null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-neutral-400">
          Variantes
        </p>
        <p className="mt-1 text-sm text-neutral-600">Elige la opción que prefieras</p>
      </div>

      <div className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {available.map((variant, index) => {
          const selected = selectedVariantId === variant.id;
          const label = formatVariantDisplayLabel(variant, index);
          const sku = resolveVariantSku(variant, productSku);

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant.id)}
              className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition duration-300 ${
                selected ? "bg-brand-night/[0.03]" : "hover:bg-neutral-50"
              }`}
            >
              <span
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition ${
                  selected ? "border-brand-night bg-brand-night" : "border-neutral-300 bg-white"
                }`}
                aria-hidden
              >
                {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-brand-night">{label}</span>
                <span className="mt-1 block text-[0.7rem] uppercase tracking-[0.14em] text-neutral-400">
                  SKU {sku}
                </span>
              </span>

              <span className="shrink-0 text-xs text-neutral-500">{variant.stock} disp.</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
