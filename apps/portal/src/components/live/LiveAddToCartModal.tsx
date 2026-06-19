import { useEffect, useId, useMemo, useState } from "react";
import { Minus, Plus, X, ZoomIn } from "lucide-react";
import type { PortalBlockReason, PortalFeaturedProduct } from "@emperatriz/types";
import LiveProductImageLightbox from "@/components/live/LiveProductImageLightbox";
import VariantPicker from "@/components/live/VariantPicker";
import { formatCurrency } from "@/lib/format";
import {
  livePurchaseBlockMessage,
  resolveLivePurchaseBlockKind,
} from "@/lib/live-purchase-block";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  normalizeProductVariants,
  resolveConfirmVariantId,
  variantsNeedSelection,
} from "@/lib/product-variants";
import { earlyPayLineTotal, productDiscountLineTotal } from "@/lib/sale-channels";

interface LiveAddToCartModalProps {
  open: boolean;
  product: PortalFeaturedProduct | null;
  cartActive: boolean;
  blockReason?: PortalBlockReason;
  thresholdBlock?: {
    orderedTotal: number;
    depositDue: number;
  } | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (
    quantity: number,
    variant: { id: string; color: string; size: string },
  ) => void;
  onActivateCart: () => void;
  onPayThreshold?: () => void;
}

function productImages(product: PortalFeaturedProduct): string[] {
  if (product.imageUrls.length > 0) return product.imageUrls;
  return product.imageUrl ? [product.imageUrl] : [];
}

export default function LiveAddToCartModal({
  open,
  product,
  cartActive,
  blockReason = "cart_opening_required",
  thresholdBlock = null,
  submitting = false,
  onClose,
  onConfirm,
  onActivateCart,
  onPayThreshold,
}: LiveAddToCartModalProps) {
  const titleId = useId();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [variantError, setVariantError] = useState(false);

  const variants = useMemo(
    () => (product ? normalizeProductVariants(product) : []),
    [product],
  );
  const needsVariant = variantsNeedSelection(variants);
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? null;
  const availableStock = selectedVariant?.stock ?? product?.stock ?? 0;

  useBodyScrollLock(open);

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelectedVariantId(null);
      setGalleryOpen(false);
      setVariantError(false);
    }
  }, [open, product?.productId]);

  useEffect(() => {
    if (selectedVariant && quantity > selectedVariant.stock) {
      setQuantity(Math.max(1, selectedVariant.stock));
    }
  }, [selectedVariant, quantity]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !galleryOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, galleryOpen]);

  const pricing = useMemo(() => {
    if (!product) return null;
    return productDiscountLineTotal(product.price, quantity, product.earlyPayDiscountPercent);
  }, [product, quantity]);

  const blockKind = resolveLivePurchaseBlockKind({ canPurchase: cartActive, blockReason });
  const blockMessage = livePurchaseBlockMessage(blockReason, thresholdBlock ?? undefined);

  if (!open || !product || !pricing) return null;

  const maxQty = Math.max(1, availableStock);
  const safeQty = Math.min(quantity, maxQty);
  const hasProductDiscount = product.earlyPayDiscountPercent > 0;
  const images = productImages(product);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <button
          type="button"
          aria-label="Cerrar"
          className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
          onClick={onClose}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative z-10 w-full max-w-md animate-sheet-up rounded-t-3xl bg-white/95 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_40px_rgba(0,0,0,0.12)] backdrop-blur-md sm:rounded-3xl sm:px-6 sm:pb-6 sm:pt-5"
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
            <button
              type="button"
              aria-label="Ver fotos del producto"
              disabled={images.length === 0}
              onClick={() => images.length > 0 && setGalleryOpen(true)}
              className="group relative size-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 disabled:cursor-default"
            >
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
              ) : null}
              {images.length > 0 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                  <span className="flex size-8 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
                    <ZoomIn className="size-4" />
                  </span>
                </span>
              ) : null}
              {images.length > 1 ? (
                <span className="absolute bottom-1 right-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {images.length}
                </span>
              ) : null}
            </button>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-night">{product.name}</p>
              {hasProductDiscount ? (
                <div className="mt-1 space-y-0.5">
                  <p className="text-sm text-neutral-400 line-through">
                    {formatCurrency(pricing.subtotal)}
                  </p>
                  <p className="text-lg font-bold text-brand-red">
                    {formatCurrency(pricing.total)}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-lg font-bold text-brand-red">
                  {formatCurrency(pricing.subtotal)}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                {availableStock > 0 ? `${availableStock} disponibles` : "Agotado"}
              </p>
            </div>
          </div>

          {blockKind !== "none" && blockMessage ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900">
              {blockMessage}
            </div>
          ) : (
            <>
              <div className="mt-5">
                <VariantPicker
                  variants={variants}
                  selectedVariantId={selectedVariantId}
                  onSelect={(id) => {
                    setSelectedVariantId(id);
                    setVariantError(false);
                  }}
                  disabled={submitting}
                />
                {variantError && needsVariant ? (
                  <p className="mt-2 text-xs font-medium text-brand-red">
                    Elige color o talla para continuar.
                  </p>
                ) : null}
              </div>

              <div className="mt-5">
                <span className="mb-2 block text-sm font-medium text-brand-night">Cantidad</span>
                <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-50/90">
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
                {hasProductDiscount && safeQty > 1 ? (
                  <p className="mt-2 text-xs text-neutral-500">
                    Total con pronto pago:{" "}
                    {formatCurrency(
                      earlyPayLineTotal(product.price, safeQty, product.earlyPayDiscountPercent)
                        .total,
                    )}
                  </p>
                ) : null}
              </div>
            </>
          )}

          <button
            type="button"
            disabled={submitting || (cartActive && availableStock < 1)}
            onClick={() => {
              if (blockKind === "cart_opening") {
                onActivateCart();
                return;
              }
              if (blockKind === "threshold") {
                onPayThreshold?.();
                return;
              }
              if (blockKind === "pending_review") {
                onClose();
                return;
              }
              const variantId = resolveConfirmVariantId(variants, selectedVariantId);
              if (!variantId) {
                setVariantError(true);
                return;
              }
              const picked = variants.find((item) => item.id === variantId);
              if (!picked) {
                setVariantError(true);
                return;
              }
              onConfirm(safeQty, {
                id: picked.id,
                color: picked.color,
                size: picked.size,
              });
            }}
            className="mt-5 w-full rounded-xl bg-brand-red px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Agregando..."
              : blockKind === "none"
                ? "Agregar a mi carrito"
                : blockKind === "threshold"
                  ? "Subir comprobante"
                  : blockKind === "pending_review"
                    ? "Entendido"
                    : "Activar carrito"}
          </button>
        </div>
      </div>

      <LiveProductImageLightbox
        open={galleryOpen}
        images={images}
        productName={product.name}
        onClose={() => setGalleryOpen(false)}
      />
    </>
  );
}
