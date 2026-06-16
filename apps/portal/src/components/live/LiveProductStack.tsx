import { useEffect, useMemo, useRef } from "react";
import type { PortalFeaturedProduct } from "@emperatriz/types";
import LiveOverlayScroll from "@/components/live/LiveOverlayScroll";
import { formatCurrency } from "@/lib/format";

interface LiveProductStackProps {
  products: PortalFeaturedProduct[];
  currentProductId?: string | null;
  onSelect: (product: PortalFeaturedProduct) => void;
  variant?: "overlay" | "panel";
  className?: string;
}

const MAX_SHOWN_PRODUCTS = 30;

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

  if (!isOverlay) {
    return (
      <div className={`max-h-full min-h-0 w-full space-y-2 overflow-y-scroll overscroll-contain ${className}`}>
        {displayProducts.map((product) => (
          <button
            key={`${product.productId}-${product.shownAt ?? "unknown"}`}
            type="button"
            onClick={() => onSelect(product)}
            className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left"
          >
            <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-brand-night">{product.name}</p>
              <p className="text-sm font-bold text-brand-red">{formatCurrency(product.price)}</p>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <LiveOverlayScroll
      scrollRef={scrollRef}
      className={`h-[min(52vh,17rem)] w-[48%] max-w-[6.5rem] shrink-0 ${className}`}
    >
      <div className="flex flex-col items-end gap-2">
        {displayProducts.map((product, index) => {
          const isCurrent = product.productId === currentProductId;
          const soldOut = product.stock < 1;
          const fromBottom = displayProducts.length - 1 - index;

          return (
            <button
              key={`${product.productId}-${product.shownAt ?? "unknown"}`}
              type="button"
              onClick={() => onSelect(product)}
              style={{ opacity: stackOpacity(fromBottom) }}
              className={`flex w-[5.25rem] shrink-0 flex-col overflow-hidden rounded-xl border text-left transition active:scale-95 sm:w-[5.75rem] ${
                isCurrent ? "border-white ring-2 ring-white/80" : "border-white/25"
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
              <div className="space-y-0.5 bg-black/80 px-1.5 py-1">
                <p className="truncate text-[10px] font-medium text-white">{product.name}</p>
                <p className="text-[10px] font-bold text-brand-gold">{formatCurrency(product.price)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </LiveOverlayScroll>
  );
}
