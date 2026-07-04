import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import type { PortalStoreProduct } from "@emperatriz/types";
import LiveAddToCartModal from "@/components/live/LiveAddToCartModal";
import VariantPicker from "@/components/live/VariantPicker";
import ProductMediaCarousel from "@/components/store/ProductMediaCarousel";
import ValidationBanner from "@/components/cart/ValidationBanner";
import { completarRegistroPathWithReturn, loginPathWithReturn } from "@/lib/auth-redirect";
import { formatCurrency } from "@/lib/format";
import {
  createPortalStoreOrder,
  fetchStoreProduct,
  storeProductToFeatured,
} from "@/lib/portal-store";
import { variantGalleryMedia } from "@/lib/product-media";
import { productDiscountLineTotal } from "@/lib/sale-channels";
import {
  formatVariantDisplayLabel,
  normalizeProductVariants,
  resolveActiveVariant,
  variantsNeedSelection,
} from "@/lib/product-variants";
import type { PortalOutletContext } from "@/components/layout/PortalLayout";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";

interface PortalContext extends PortalOutletContext {}

export default function StoreProductDetailPage() {
  const { productId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isGuest = !user;
  const { profile, depositStatus, canPurchase, privateSnapshot } = useOutletContext<PortalContext>();
  const { openCartModal, openReceiptModal, setToast, bumpProfileReload } = useUiStore();

  const [product, setProduct] = useState<PortalStoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

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

  useEffect(() => {
    setSelectedVariantId(null);
  }, [product?.productId]);

  const handlePayThreshold = () => {
    const due = privateSnapshot?.thresholdBlock?.depositDue ?? 0;
    if (due <= 0) return;
    openReceiptModal({ purpose: "notes", amount: due });
  };

  const handleApartarClick = () => {
    const returnPath = `${location.pathname}${location.search}`;
    if (isGuest) {
      navigate(loginPathWithReturn(returnPath));
      return;
    }
    if (!profile) {
      navigate(completarRegistroPathWithReturn(returnPath));
      return;
    }
    setModalOpen(true);
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

  const featuredProduct = useMemo(
    () => (product ? storeProductToFeatured(product) : null),
    [product],
  );

  const variants = useMemo(
    () => (featuredProduct ? normalizeProductVariants(featuredProduct) : []),
    [featuredProduct],
  );

  const activeVariant = useMemo(
    () => resolveActiveVariant(variants, selectedVariantId),
    [variants, selectedVariantId],
  );

  const galleryMedia = useMemo(
    () => (product ? variantGalleryMedia(activeVariant, product) : []),
    [product, activeVariant],
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-neutral-500">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (error || !product || !featuredProduct) {
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

  const hasProductDiscount = product.earlyPayDiscountPercent > 0;
  const pricing = productDiscountLineTotal(product.price, 1, product.earlyPayDiscountPercent);
  const variantSummary = variants
    .filter((variant) => variant.stock > 0)
    .map((variant, index) => `${formatVariantDisplayLabel(variant, index)} (${variant.stock})`)
    .join(" · ");

  return (
    <>
      <div className="space-y-5">
        {!isGuest && depositStatus === "pending" ? <ValidationBanner /> : null}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-brand-night"
        >
          <ArrowLeft className="size-4" />
          Volver
        </button>

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm lg:grid lg:grid-cols-2 lg:items-start lg:gap-0">
          <div className="space-y-3 p-4 sm:p-5 lg:p-6">
            {variantsNeedSelection(variants) ? (
              <VariantPicker
                variants={variants}
                selectedVariantId={selectedVariantId}
                onSelect={setSelectedVariantId}
              />
            ) : null}
            <ProductMediaCarousel media={galleryMedia} productName={product.name} />
          </div>

          <div className="space-y-4 p-5 sm:p-6 lg:flex lg:flex-col lg:justify-center lg:p-8 lg:py-10 xl:p-10">
            <div className="flex flex-wrap items-center gap-2">
              {hasProductDiscount ? (
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

            {hasProductDiscount ? (
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
              onClick={handleApartarClick}
              className="w-full rounded-xl bg-brand-red px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-50 lg:max-w-md lg:text-base"
            >
              {product.stock < 1 ? "Agotado" : isGuest ? "Apartar pieza (requiere cuenta)" : "Apartar pieza"}
            </button>
          </div>
        </div>
      </div>

      {!isGuest && profile ? (
        <LiveAddToCartModal
          open={modalOpen}
          product={featuredProduct}
          cartActive={canPurchase}
          blockReason={privateSnapshot?.blockReason ?? "cart_opening_required"}
          thresholdBlock={privateSnapshot?.thresholdBlock ?? null}
          submitting={submitting}
          initialVariantId={selectedVariantId}
          onClose={() => setModalOpen(false)}
          onConfirm={(quantity, variant) => void handleConfirmOrder(quantity, variant)}
          onActivateCart={openCartModal}
          onPayThreshold={handlePayThreshold}
        />
      ) : null}
    </>
  );
}
