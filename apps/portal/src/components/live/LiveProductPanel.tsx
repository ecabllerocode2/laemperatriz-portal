import { ShoppingBag } from "lucide-react";
import type { PortalFeaturedProduct } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";

interface LiveProductPanelProps {
  products: PortalFeaturedProduct[];
  currentProductId?: string | null;
  cartActive: boolean;
  onSelect: (product: PortalFeaturedProduct) => void;
}

export default function LiveProductPanel({
  products,
  currentProductId,
  cartActive,
  onSelect,
}: LiveProductPanelProps) {
  if (products.length === 0) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500 shadow-sm">
        Cuando el equipo muestre una pieza, aparecerá aquí para apartarla.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg text-brand-night">Piezas del live</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Toca una pieza para apartarla{cartActive ? "" : " (necesitas carrito activo)"}.
        </p>
      </div>

      <div className="space-y-2">
        {products.map((product) => {
          const isCurrent = product.productId === currentProductId;
          const soldOut = product.stock < 1;

          return (
            <button
              key={`${product.productId}-${product.shownAt ?? "unknown"}`}
              type="button"
              onClick={() => onSelect(product)}
              className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left shadow-sm transition hover:shadow-md ${
                isCurrent ? "border-brand-red/40 ring-1 ring-brand-red/20" : "border-neutral-200"
              }`}
            >
              <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-brand-night">{product.name}</p>
                  {isCurrent ? (
                    <span className="shrink-0 rounded-full bg-brand-red/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-red">
                      En pantalla
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-base font-bold text-brand-red">
                  {formatCurrency(product.price)}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {soldOut ? "Agotado" : `${product.stock} disponibles`}
                </p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-red text-white">
                <ShoppingBag className="size-4" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
