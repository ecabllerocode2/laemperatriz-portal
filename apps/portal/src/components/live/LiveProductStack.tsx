import type { PortalFeaturedProduct } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";

interface LiveProductStackProps {
  products: PortalFeaturedProduct[];
  currentProductId?: string | null;
  onSelect: (product: PortalFeaturedProduct) => void;
  variant?: "overlay" | "panel";
  className?: string;
}

/** index 0 = pieza más reciente (abajo, más visible). */
function stackOpacity(index: number): number {
  return Math.max(0.2, 1 - index * 0.14);
}

export default function LiveProductStack({
  products,
  currentProductId,
  onSelect,
  variant = "overlay",
  className = "",
}: LiveProductStackProps) {
  if (products.length === 0) return null;

  const isOverlay = variant === "overlay";

  return (
    <div
      className={`pointer-events-none flex flex-col-reverse items-end justify-end gap-2 overflow-hidden ${
        isOverlay ? "live-overlay-fade max-h-[42vh] w-1/2" : "max-h-full w-full"
      } ${className}`}
    >
      {products.map((product, index) => {
        const isCurrent = product.productId === currentProductId;
        const soldOut = product.stock < 1;

        return (
          <button
            key={`${product.productId}-${product.shownAt ?? "unknown"}`}
            type="button"
            onClick={() => onSelect(product)}
            style={{ opacity: isOverlay ? stackOpacity(index) : 1 }}
            className={`pointer-events-auto flex w-[5.25rem] shrink-0 flex-col overflow-hidden rounded-xl border text-left transition active:scale-95 sm:w-[5.75rem] ${
              isCurrent
                ? "border-white ring-2 ring-white/80"
                : isOverlay
                  ? "border-white/25"
                  : "border-neutral-200"
            }`}
          >
            <div className="relative aspect-square bg-neutral-800">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
              ) : null}
              {isCurrent ? (
                <span className="absolute left-1 top-1 rounded-full bg-brand-red px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  Ahora
                </span>
              ) : null}
              {soldOut ? (
                <span className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-center text-[9px] font-semibold text-white">
                  Agotado
                </span>
              ) : null}
            </div>
            <div
              className={`space-y-0.5 px-1.5 py-1 ${
                isOverlay ? "bg-black/80" : "bg-white"
              }`}
            >
              <p
                className={`truncate text-[10px] font-medium ${
                  isOverlay ? "text-white" : "text-brand-night"
                }`}
              >
                {product.name}
              </p>
              <p
                className={`text-[10px] font-bold ${
                  isOverlay ? "text-brand-gold" : "text-brand-red"
                }`}
              >
                {formatCurrency(product.price)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
