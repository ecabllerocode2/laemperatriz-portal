import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { Loader2, Radio, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import type { PortalStoreProduct } from "@emperatriz/types";
import StoreProductCard from "@/components/store/StoreProductCard";
import ValidationBanner from "@/components/cart/ValidationBanner";
import { usePortalLive } from "@/hooks/usePortalLive";
import { usePortalStoreCatalog } from "@/hooks/usePortalStoreCatalog";
import { usePortalStoreCategories } from "@/hooks/usePortalStoreCategories";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { formatCurrency } from "@/lib/format";
import type { PortalOutletContext } from "@/components/layout/PortalLayout";
import { useUiStore } from "@/stores/ui.store";

interface PortalContext extends PortalOutletContext {}

export default function StorePage() {
  const navigate = useNavigate();
  const { depositStatus, privateSnapshot } = useOutletContext<PortalContext>();
  const { openReceiptModal } = useUiStore();
  const { session, loading: liveLoading } = usePortalLive(true);
  const liveActive = Boolean(session?.id);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const { categories } = usePortalStoreCategories();
  const { products, loading, loadingMore, hasMore, error, loadMore, reload } =
    usePortalStoreCatalog({ search: debouncedSearch, categoryId });

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) loadMore();
  }, [hasMore, loadMore, loadingMore]);

  const infiniteScrollRef = useInfiniteScroll(hasMore && !loading, handleLoadMore);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const categoryOptions = useMemo(() => {
    const fromApi = categories.map((category) => ({
      id: category.id,
      label: category.name,
    }));
    const productCategories = new Set(products.map((product) => product.categoryId));
    for (const id of productCategories) {
      if (!fromApi.some((row) => row.id === id)) {
        fromApi.push({ id, label: id.replace(/-/g, " ") });
      }
    }
    return fromApi.sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [categories, products]);

  const handlePayThreshold = () => {
    const due = privateSnapshot?.thresholdBlock?.depositDue ?? 0;
    if (due <= 0) return;
    openReceiptModal({ purpose: "notes", amount: due });
  };

  const openProduct = useCallback(
    (product: PortalStoreProduct) => {
      navigate(`/tienda/${product.productId}`);
    },
    [navigate],
  );

  return (
    <>
      <div className="space-y-5">
        {depositStatus === "pending" ? <ValidationBanner /> : null}

        {privateSnapshot?.thresholdBlock?.active ? (
          <section className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-950">
            <p>
              Has pedido {formatCurrency(privateSnapshot.thresholdBlock.orderedTotal)}. Para seguir
              apartando, liquida {formatCurrency(privateSnapshot.thresholdBlock.depositDue)}.
            </p>
            <button
              type="button"
              onClick={handlePayThreshold}
              className="mt-3 rounded-xl bg-brand-night px-4 py-2.5 text-sm font-semibold text-white"
            >
              Subir comprobante
            </button>
          </section>
        ) : null}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-night via-[#252545] to-brand-red px-5 py-7 text-white shadow-lg sm:px-8 sm:py-9 lg:flex lg:items-end lg:justify-between lg:gap-10 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-brand-gold/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 left-8 size-32 rounded-full bg-brand-red/30 blur-2xl" />

          <div className="relative lg:max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="size-3.5 text-brand-gold" />
              Tienda La Emperatriz
            </div>
            <h1 className="mt-3 font-display text-2xl leading-tight sm:text-3xl lg:text-4xl">
              Encuentra tu próxima pieza favorita
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base lg:text-lg">
              Aparta con el mismo flujo del live: nota del día, pronto pago y envío en tu ciclo de 7
              días.
            </p>
          </div>

          <div className="relative lg:shrink-0 lg:pb-1">
            {liveActive ? (
              <button
                type="button"
                onClick={() => navigate("/live")}
                className="live-pulse-cta mt-5 inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-red/30 lg:mt-0 lg:px-6 lg:py-3.5 lg:text-base"
              >
                <span className="relative flex size-2.5" aria-hidden>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/80" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-white" />
                </span>
                <Radio className="size-4" />
                Entrar al live ahora
              </button>
            ) : !liveLoading ? (
              <p className="mt-5 text-xs text-white/65 lg:mt-0 lg:max-w-xs lg:text-sm">
                Cuando haya transmisión en vivo, verás aquí el acceso directo.
              </p>
            ) : null}
          </div>
        </section>

        <section className="space-y-3 lg:space-y-4">
          <div className="relative lg:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="w-full rounded-2xl border border-neutral-200 bg-white py-3 pl-10 pr-10 text-sm shadow-sm outline-none ring-brand-red/30 transition focus:ring-2"
            />
            {searchInput ? (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          {categoryOptions.length > 0 ? (
            <div className="live-scroll-touch flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
              <button
                type="button"
                onClick={() => setCategoryId(null)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  categoryId === null
                    ? "bg-brand-night text-white"
                    : "bg-white text-neutral-600 ring-1 ring-neutral-200"
                }`}
              >
                Todas
              </button>
              {categoryOptions.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
                    categoryId === category.id
                      ? "bg-brand-night text-white"
                      : "bg-white text-neutral-600 ring-1 ring-neutral-200"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          ) : null}
        </section>

        {error ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
            {error}
            <button
              type="button"
              onClick={() => void reload()}
              className="mt-2 font-semibold underline"
            >
              Reintentar
            </button>
          </section>
        ) : null}

        {loading ? (
          <div className="flex min-h-[12rem] items-center justify-center text-neutral-500">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
            <ShoppingBag className="mx-auto size-8 text-neutral-300" />
            <p className="mt-3 text-sm font-medium text-brand-night">No hay productos disponibles</p>
            <p className="mt-1 text-sm text-neutral-500">
              {debouncedSearch || categoryId
                ? "Prueba otra búsqueda o categoría."
                : "Vuelve pronto: el equipo está preparando novedades."}
            </p>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 lg:gap-4 xl:gap-5">
              {products.map((product) => (
                <StoreProductCard
                  key={product.productId}
                  product={product}
                  onSelect={() => openProduct(product)}
                />
              ))}
            </div>

            {hasMore ? (
              <div ref={infiniteScrollRef} className="flex justify-center py-6">
                {loadingMore ? <Loader2 className="size-5 animate-spin text-neutral-400" /> : null}
              </div>
            ) : null}
          </>
        )}

        <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-sm text-neutral-600">
          <p>
            ¿Ya apartaste piezas? Revisa tus notas y pagos en{" "}
            <Link to="/compras" className="font-semibold text-brand-red underline-offset-2 hover:underline">
              Mis compras
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
}
