import type { PortalFeaturedProduct } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";

interface FeaturedLiveHistoryProps {
  history: PortalFeaturedProduct[];
  currentProductId?: string | null;
}

export default function FeaturedLiveHistory({
  history,
  currentProductId,
}: FeaturedLiveHistoryProps) {
  const items = history.filter((item) => item.productId !== currentProductId);
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Piezas anteriores del live
      </h3>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {items.map((product) => (
          <div
            key={`${product.productId}-${product.shownAt ?? "unknown"}`}
            className="w-24 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
          >
            <div className="aspect-square bg-neutral-100">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
              ) : null}
            </div>
            <div className="space-y-0.5 px-2 py-1.5">
              <p className="truncate text-[11px] font-medium text-brand-night">{product.name}</p>
              <p className="text-[11px] font-bold text-brand-red">{formatCurrency(product.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
