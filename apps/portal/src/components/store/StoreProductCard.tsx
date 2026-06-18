import type { PortalStoreProduct } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";
import { earlyPayLineTotal } from "@/lib/sale-channels";

interface StoreProductCardProps {
  product: PortalStoreProduct;
  onSelect: () => void;
}

export default function StoreProductCard({ product, onSelect }: StoreProductCardProps) {
  const hasEarlyPay = product.earlyPayDiscountPercent > 0;
  const pricing = earlyPayLineTotal(product.price, 1, product.earlyPayDiscountPercent);
  const soldOut = product.stock < 1;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={soldOut}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-neutral-400">
            Sin foto
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-end gap-2 p-2">
          {hasEarlyPay ? (
            <span className="rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              Descuento −{product.earlyPayDiscountPercent}%
            </span>
          ) : null}
        </div>
        {soldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
            Agotado
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3 lg:p-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-brand-night lg:min-h-0 lg:text-[0.9375rem]">
          {product.name}
        </p>
        <div className="mt-auto pt-2">
          {hasEarlyPay ? (
            <div className="space-y-0.5">
              <p className="text-xs text-neutral-400 line-through">{formatCurrency(pricing.subtotal)}</p>
              <p className="text-base font-bold text-brand-red">{formatCurrency(pricing.total)}</p>
            </div>
          ) : (
            <p className="text-base font-bold text-brand-red">{formatCurrency(product.price)}</p>
          )}
          <p className="mt-1 text-[11px] text-neutral-500">
            {product.stock} disponible{product.stock === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </button>
  );
}
