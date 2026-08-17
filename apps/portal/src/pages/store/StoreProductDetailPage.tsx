import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { PortalStoreProduct } from "@emperatriz/types";
import VariantPicker from "@/components/live/VariantPicker";
import ProductMediaCarousel from "@/components/store/ProductMediaCarousel";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { formatCurrency } from "@/lib/format";
import { fetchStoreProduct, storeProductToFeatured } from "@/lib/portal-store";
import { variantGalleryMedia } from "@/lib/product-media";
import { productDiscountLineTotal } from "@/lib/sale-channels";
import {
  formatVariantLabel,
  normalizeProductVariants,
  resolveActiveVariant,
  variantsNeedSelection,
} from "@/lib/product-variants";
import { catalogProductWhatsAppMessage, catalogWhatsAppUrl } from "@/lib/whatsapp-order";

export default function StoreProductDetailPage() {
  const { productId = "" } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<PortalStoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const needsVariant = variantsNeedSelection(variants);
  const canOrder = product.stock >= 1 && Boolean(activeVariant) && (!needsVariant || selectedVariantId);
  const variantLabel = activeVariant ? formatVariantLabel(activeVariant) : null;
  const whatsappHref = catalogWhatsAppUrl(
    catalogProductWhatsAppMessage({
      productName: product.name,
      sku: product.sku,
      variantLabel,
    }),
  );

  return (
    <div className="portal-shell-store space-y-6 py-8 sm:py-10 lg:py-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-brand-night"
      >
        <ArrowLeft className="size-4" />
        Volver
      </button>

      <div className="overflow-hidden lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14">
        <div className="space-y-4">
          {needsVariant ? (
            <VariantPicker
              variants={variants}
              selectedVariantId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          ) : null}
          <ProductMediaCarousel media={galleryMedia} productName={product.name} />
        </div>

        <div className="space-y-5 pt-6 lg:pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {hasProductDiscount ? (
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-brand-gold">
                −{product.earlyPayDiscountPercent}% descuento
              </span>
            ) : null}
          </div>

          <div>
            <h1 className="font-display text-3xl font-normal text-brand-night lg:text-4xl xl:text-5xl">
              {product.name}
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-neutral-400">SKU {product.sku}</p>
          </div>

          {hasProductDiscount ? (
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-medium text-brand-night">{formatCurrency(pricing.total)}</p>
              <p className="text-sm text-neutral-400 line-through">{formatCurrency(pricing.subtotal)}</p>
            </div>
          ) : (
            <p className="text-2xl font-medium text-brand-night">{formatCurrency(product.price)}</p>
          )}

          {product.description ? (
            <p className="text-sm leading-relaxed text-neutral-600">{product.description}</p>
          ) : null}

          {canOrder ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 bg-brand-night px-4 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-white transition duration-300 hover:bg-brand-red lg:max-w-sm"
            >
              <WhatsAppIcon className="size-5" />
              Pedir por WhatsApp
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="w-full rounded-xl bg-neutral-200 px-4 py-3.5 text-sm font-semibold text-neutral-500 lg:max-w-md lg:text-base"
            >
              {product.stock < 1 ? "Agotado" : "Elige una variante para pedir"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
