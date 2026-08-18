import type { PortalProductVariant, PortalStoreProduct } from "@emperatriz/types";
import { ImageIcon } from "lucide-react";
import ProductMediaCarousel from "@/components/store/ProductMediaCarousel";
import { variantCoverImageUrl, variantGalleryMedia } from "@/lib/product-media";
import {
  formatVariantDisplayLabel,
  resolveActiveVariant,
  variantsAvailableForSale,
  variantsNeedSelection,
} from "@/lib/product-variants";

interface ProductVariantMediaGalleryProps {
  variants: PortalProductVariant[];
  selectedVariantId: string | null;
  onSelectVariant: (variantId: string) => void;
  product: PortalStoreProduct;
  productName: string;
}

export default function ProductVariantMediaGallery({
  variants,
  selectedVariantId,
  onSelectVariant,
  product,
  productName,
}: ProductVariantMediaGalleryProps) {
  const available = variantsAvailableForSale(variants);
  const showThumbnails = variantsNeedSelection(variants);
  const activeVariant = resolveActiveVariant(variants, selectedVariantId);
  const galleryMedia = variantGalleryMedia(activeVariant, product);

  return (
    <div className="flex items-start gap-3 sm:gap-4">
      {showThumbnails ? (
        <div
          className="live-scroll-touch flex max-h-[min(72vh,36rem)] w-[4.25rem] shrink-0 flex-col gap-2 overflow-y-auto pb-1 sm:w-[4.75rem]"
          aria-label="Variantes del producto"
        >
          {available.map((variant, index) => {
            const selected = selectedVariantId === variant.id;
            const thumbUrl = variantCoverImageUrl(variant, product);
            const label = formatVariantDisplayLabel(variant, index);

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => onSelectVariant(variant.id)}
                aria-label={`Ver variante ${label}`}
                aria-pressed={selected}
                className={`group relative aspect-[3/4] w-full overflow-hidden rounded-md border bg-neutral-100 transition duration-300 ${
                  selected
                    ? "border-brand-red ring-2 ring-brand-red/20"
                    : "border-neutral-200 hover:border-brand-red/40"
                }`}
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt=""
                    className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-neutral-300">
                    <ImageIcon className="size-5" />
                  </span>
                )}
                {selected ? (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-brand-red/80 px-1 py-1 text-[0.55rem] font-medium leading-tight text-white">
                    {label.length > 18 ? `${label.slice(0, 16)}…` : label}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <ProductMediaCarousel
          key={selectedVariantId ?? "default"}
          media={galleryMedia}
          productName={productName}
        />
      </div>
    </div>
  );
}
