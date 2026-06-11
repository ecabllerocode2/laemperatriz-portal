import { ShoppingBag } from "lucide-react";
import type { PortalFeaturedProduct } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";

interface FeaturedLiveProductProps {
  product: PortalFeaturedProduct;
  cartActive: boolean;
  onSelect: () => void;
}

export default function FeaturedLiveProduct({
  product,
  cartActive,
  onSelect,
}: FeaturedLiveProductProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full overflow-hidden rounded-2xl border border-brand-red/20 bg-white text-left shadow-sm transition hover:border-brand-red/40 hover:shadow-md"
    >
      <div className="bg-brand-red/5 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-brand-red">
        Pieza en pantalla
      </div>
      <div className="flex items-center gap-4 p-4">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:size-24">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-brand-night sm:text-lg">{product.name}</p>
          <p className="mt-1 text-lg font-bold text-brand-red sm:text-xl">
            {formatCurrency(product.price)}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
          </p>
          <span className="mt-2 inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
            Azul · pronto pago
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1 text-brand-red">
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-red text-white">
            <ShoppingBag className="size-5" />
          </span>
          <span className="text-[11px] font-semibold">
            {cartActive ? "Apartar" : "Ver"}
          </span>
        </div>
      </div>
    </button>
  );
}
