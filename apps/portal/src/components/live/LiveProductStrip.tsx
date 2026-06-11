import type { PortalFeaturedProduct } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";

interface LiveProductStripProps {
  products: PortalFeaturedProduct[];
  currentProductId?: string | null;
  onSelect: (product: PortalFeaturedProduct) => void;
}

export default function LiveProductStrip({
  products,
  currentProductId,
  onSelect,
}: LiveProductStripProps) {
  if (products.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-10">
      <div className="pointer-events-auto flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {products.map((product) => {
          const isCurrent = product.productId === currentProductId;
          const soldOut = product.stock < 1;

          return (
            <button
              key={`${product.productId}-${product.shownAt ?? "unknown"}`}
              type="button"
              onClick={() => onSelect(product)}
              className={`w-[4.75rem] shrink-0 overflow-hidden rounded-xl border text-left transition active:scale-95 ${
                isCurrent
                  ? "border-white ring-2 ring-white/80"
                  : "border-white/25 opacity-90 hover:opacity-100"
              }`}
            >
              <div className="relative aspect-square bg-neutral-800">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="size-full object-cover"
                  />
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
                <p className="text-[10px] font-bold text-brand-gold">
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
