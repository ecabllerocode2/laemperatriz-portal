import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import type { PortalStoreProduct } from "@emperatriz/types";
import LiveAddToCartModal from "@/components/live/LiveAddToCartModal";
import LiveProductImageLightbox from "@/components/live/LiveProductImageLightbox";
import ValidationBanner from "@/components/cart/ValidationBanner";
import { formatCurrency } from "@/lib/format";
import {
  createPortalStoreOrder,
  fetchStoreProduct,
  storeProductToFeatured,
} from "@/lib/portal-store";
import { earlyPayLineTotal } from "@/lib/sale-channels";
import { normalizeProductVariants } from "@/lib/product-variants";
import type { PortalOutletContext } from "@/components/layout/PortalLayout";
import { useUiStore } from "@/stores/ui.store";

interface PortalContext extends PortalOutletContext {}

export default function StoreProductDetailPage() {
  const { productId = "" } = useParams();
  const navigate = useNavigate();
  const { depositStatus, canPurchase, privateSnapshot } = useOutletContext<PortalContext>();
  const { openCartModal, openReceiptModal, setToast, bumpProfileReload } = useUiStore();

  const [product, setProduct] = useState<PortalStoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchStoreProduct(productId)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Producto no disponible.");
          setProduct(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handlePayThreshold = () => {
    const due = privateSnapshot?.thresholdBlock?.depositDue ?? 0;
    if (due <= 0) return;
    openReceiptModal({ purpose: "notes", amount: due });
  };

  const handleConfirmOrder = async (
    quantity: number,
    variant: { id: string; color: string; size: string },
  ) => {
    if (!product || !canPurchase) return;

    setSubmitting(true);
    try {
      const result = await createPortalStoreOrder({
        productId: product.productId,
        quantity,
        variantId: variant.id,
        variantColor: variant.color,
        variantSize: variant.size,
      });
      setModalOpen(false);
      bumpProfileReload();
      setToast(`Agregamos ${result.quantity} × ${result.productName} a tu nota del día.`);
      navigate("/compras");
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : "No se pudo agregar la pieza.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-neutral-500">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-800">
        {error ?? "Producto no disponible."}
        <div className="mt-4">
          <Link to="/" className="font-semibold underline">
            Volver a la tienda
          </Link>
        </div>
      </section>
    );
  }

  const hasEarlyPay = product.earlyPayDiscountPercent > 0;
  const pricing = earlyPayLineTotal(product.price, 1, product.earlyPayDiscountPercent);
  const variants = normalizeProductVariants(storeProductToFeatured(product));
  const variantSummary = variants
    .filter((variant) => variant.stock > 0)
    .map((variant) =>
      variant.color === "No aplica" && variant.size === "No aplica"
        ? `${variant.stock} pzs`
        : `${variant.color}${variant.size !== "No aplica" ? ` · ${variant.size}` : ""} (${variant.stock})`,
    )
    .join(" · ");

  return (
    <>
      <div className="space-y-5">
        {depositStatus === "pending" ? <ValidationBanner /> : null}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-brand-night"
        >
          <ArrowLeft className="size-4" />
          Volver
        </button>

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm lg:grid lg:grid-cols-2 lg:items-start lg:gap-0">
          <button
            type="button"
            className="relative block aspect-[4/5] w-full bg-neutral-100 lg:sticky lg:top-6 lg:aspect-auto lg:min-h-[28rem] lg:self-start"
            onClick={() => product.imageUrls.length > 0 && setGalleryOpen(true)}
          >
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
            ) : null}
            {product.imageUrls.length > 1 ? (
              <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
                {product.imageUrls.length} fotos
              </span>
            ) : null}
          </button>

          <div className="space-y-4 p-5 sm:p-6 lg:flex lg:flex-col lg:justify-center lg:p-8 lg:py-10 xl:p-10">
            <div className="flex flex-wrap items-center gap-2">
              {hasEarlyPay ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  Descuento −{product.earlyPayDiscountPercent}%
                </span>
              ) : null}
            </div>

            <div>
              <h1 className="font-display text-2xl text-brand-night lg:text-3xl xl:text-4xl">
                {product.name}
              </h1>
              <p className="mt-1 text-xs text-neutral-500 lg:text-sm">SKU {product.sku}</p>
            </div>

            {hasEarlyPay ? (
              <div className="space-y-1">
                <p className="text-sm text-neutral-400 line-through">{formatCurrency(pricing.subtotal)}</p>
                <p className="text-2xl font-bold text-brand-red">{formatCurrency(pricing.total)}</p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-brand-red">{formatCurrency(product.price)}</p>
            )}

            {product.description ? (
              <p className="text-sm leading-relaxed text-neutral-600">{product.description}</p>
            ) : null}

            {variantSummary ? (
              <p className="text-sm text-neutral-600">
                <span className="font-semibold text-brand-night">Disponible:</span> {variantSummary}
              </p>
            ) : null}

            <button
              type="button"
              disabled={product.stock < 1}
              onClick={() => setModalOpen(true)}
              className="w-full rounded-xl bg-brand-red px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-50 lg:max-w-md lg:text-base"
            >
              {product.stock < 1 ? "Agotado" : "Apartar pieza"}
            </button>
          </div>
        </div>
      </div>

      <LiveAddToCartModal
        open={modalOpen}
        product={storeProductToFeatured(product)}
        cartActive={canPurchase}
        blockReason={privateSnapshot?.blockReason ?? "cart_opening_required"}
        thresholdBlock={privateSnapshot?.thresholdBlock ?? null}
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onConfirm={(quantity, variant) => void handleConfirmOrder(quantity, variant)}
        onActivateCart={openCartModal}
        onPayThreshold={handlePayThreshold}
      />

      <LiveProductImageLightbox
        open={galleryOpen}
        images={product.imageUrls}
        productName={product.name}
        onClose={() => setGalleryOpen(false)}
      />
    </>
  );
}
