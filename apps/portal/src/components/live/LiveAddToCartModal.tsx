import { useEffect, useId, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import type { PortalFeaturedProduct } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";

interface LiveAddToCartModalProps {
  open: boolean;
  product: PortalFeaturedProduct | null;
  cartActive: boolean;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  onActivateCart: () => void;
}

export default function LiveAddToCartModal({
  open,
  product,
  cartActive,
  submitting = false,
  onClose,
  onConfirm,
  onActivateCart,
}: LiveAddToCartModalProps) {
  const titleId = useId();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) setQuantity(1);
  }, [open, product?.productId]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !product) return null;

  const maxQty = Math.max(1, product.stock);
  const safeQty = Math.min(quantity, maxQty);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md animate-sheet-up rounded-t-3xl bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:rounded-3xl sm:px-6 sm:pb-6 sm:pt-5"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-200 sm:hidden" />

        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-display text-xl text-brand-night">
            Apartar pieza
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-brand-night">{product.name}</p>
            <p className="mt-1 text-lg font-bold text-brand-red">{formatCurrency(product.price)}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
              Canal azul · elegible para pronto pago
            </span>
          </div>
        </div>

        {!cartActive ? (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Activa tu carrito con el depósito para poder apartar piezas en el live.
          </div>
        ) : (
          <div className="mt-5">
            <span className="mb-2 block text-sm font-medium text-brand-night">Cantidad</span>
            <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-50">
              <button
                type="button"
                aria-label="Menos"
                disabled={safeQty <= 1 || submitting}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex size-11 items-center justify-center text-brand-night disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-10 text-center text-base font-semibold text-brand-night">
                {safeQty}
              </span>
              <button
                type="button"
                aria-label="Más"
                disabled={safeQty >= maxQty || submitting}
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                className="flex size-11 items-center justify-center text-brand-night disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={submitting || (cartActive && product.stock < 1)}
          onClick={() => {
            if (!cartActive) {
              onActivateCart();
              return;
            }
            onConfirm(safeQty);
          }}
          className="mt-5 w-full rounded-xl bg-brand-red px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Agregando..."
            : cartActive
              ? "Agregar a mi carrito"
              : "Activar carrito"}
        </button>
      </div>
    </div>
  );
}
