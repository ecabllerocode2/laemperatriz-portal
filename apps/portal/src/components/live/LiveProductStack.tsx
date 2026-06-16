import { useEffect, useMemo, useRef } from "react";
import type { PortalFeaturedProduct } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";

interface LiveProductStackProps {
  products: PortalFeaturedProduct[];
  currentProductId?: string | null;
  onSelect: (product: PortalFeaturedProduct) => void;
  variant?: "overlay" | "panel";
  className?: string;
}

const MAX_SHOWN_PRODUCTS = 30;

/** fromBottom 0 = pieza más reciente (abajo). */
function stackOpacity(fromBottom: number): number {
  return Math.max(0.35, 1 - fromBottom * 0.08);
}

export default function LiveProductStack({
  products,
  currentProductId,
  onSelect,
  variant = "overlay",
  className = "",
}: LiveProductStackProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleProducts = products.slice(-MAX_SHOWN_PRODUCTS);
  const displayProducts = useMemo(
    () => [...visibleProducts].reverse(),
    [visibleProducts],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [displayProducts.length, currentProductId]);

  if (products.length === 0) return null;

  const isOverlay = variant === "overlay";

  return (
    <div
      ref={scrollRef}
      className={`live-scroll-touch touch-pan-y ${
        isOverlay
          ? "live-overlay-fade pointer-events-auto h-[min(55vh,16rem)] max-h-[min(55vh,16rem)] w-1/2 min-h-0 overflow-y-auto overscroll-contain scrollbar-none"
          : "max-h-full min-h-0 w-full overflow-y-auto overscroll-contain"
      } ${className}`}
    >
      <div className={`flex flex-col gap-2 ${isOverlay ? "items-end pb-1" : "items-stretch"}`}>
        {displayProducts.map((product, index) => {
          const isCurrent = product.productId === currentProductId;
          const soldOut = product.stock < 1;
          const fromBottom = displayProducts.length - 1 - index;

          return (
            <button
              key={`${product.productId}-${product.shownAt ?? "unknown"}`}
              type="button"
              onClick={() => onSelect(product)}
              style={{ opacity: isOverlay ? stackOpacity(fromBottom) : 1 }}
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
    </div>
  );
}
