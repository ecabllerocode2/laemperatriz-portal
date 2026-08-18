import type { PortalStoreProduct } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";
import { productDiscountLineTotal } from "@/lib/sale-channels";

interface StoreProductCardProps {
  product: PortalStoreProduct;
  onSelect: () => void;
}

export default function StoreProductCard({ product, onSelect }: StoreProductCardProps) {
  const hasProductDiscount = product.earlyPayDiscountPercent > 0;
  const pricing = productDiscountLineTotal(product.price, 1, product.earlyPayDiscountPercent);
  const soldOut = product.stock < 1;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={soldOut}
      className="group flex w-full flex-col overflow-hidden bg-transparent text-left transition duration-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-neutral-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-neutral-400">
            Sin foto
          </div>
        )}
        {hasProductDiscount ? (
          <span className="absolute left-2 top-2 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-medium tracking-wide text-white">
            −{product.earlyPayDiscountPercent}%
          </span>
        ) : null}
        {soldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-xs font-medium uppercase tracking-[0.2em] text-brand-night backdrop-blur-[2px]">
            Agotado
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-brand-night transition duration-300 group-hover:text-brand-red">
          {product.name}
        </p>
        <div className="mt-2">
          {hasProductDiscount ? (
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-medium text-brand-night">{formatCurrency(pricing.total)}</p>
              <p className="text-xs text-neutral-400 line-through">{formatCurrency(pricing.subtotal)}</p>
            </div>
          ) : (
            <p className="text-sm font-medium text-brand-night">{formatCurrency(product.price)}</p>
          )}
        </div>
      </div>
    </button>
  );
}
