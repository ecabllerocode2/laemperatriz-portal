import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import type { PortalStoreProduct } from "@emperatriz/types";
import StoreProductCard from "@/components/store/StoreProductCard";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { usePortalStoreCatalog } from "@/hooks/usePortalStoreCatalog";
import { usePortalStoreCategories } from "@/hooks/usePortalStoreCategories";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { catalogWhatsAppUrl } from "@/lib/whatsapp-order";

const FEATURED_COUNT = 4;

export default function StorePage() {
  const navigate = useNavigate();
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

  const featuredProducts = useMemo(() => {
    if (debouncedSearch || categoryId) return [];
    return products.filter((product) => product.stock > 0).slice(0, FEATURED_COUNT);
  }, [categoryId, debouncedSearch, products]);

  const catalogProducts = useMemo(() => {
    if (featuredProducts.length === 0) return products;
    const featuredIds = new Set(featuredProducts.map((product) => product.productId));
    return products.filter((product) => !featuredIds.has(product.productId));
  }, [featuredProducts, products]);

  const openProduct = useCallback(
    (product: PortalStoreProduct) => {
      navigate(`/tienda/${product.productId}`);
    },
    [navigate],
  );

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-night via-[#252545] to-brand-red px-5 py-7 text-white shadow-lg sm:px-8 sm:py-9 lg:flex lg:items-end lg:justify-between lg:gap-10 lg:px-10 lg:py-10">
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-brand-gold/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-8 size-32 rounded-full bg-brand-red/30 blur-2xl" />

        <div className="relative lg:max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="size-3.5 text-brand-gold" />
            Catálogo en línea
          </div>
          <h1 className="mt-3 font-display text-2xl leading-tight sm:text-3xl lg:text-4xl">
            Piezas listas para enamorar
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base lg:text-lg">
            Explora el catálogo de La Emperatriz y pide tu favorita por WhatsApp.
          </p>
        </div>

        <a
          href={catalogWhatsAppUrl("Hola, vengo del catálogo de La Emperatriz.")}
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg lg:mt-0 lg:px-6 lg:py-3.5 lg:text-base"
        >
          <WhatsAppIcon className="size-4" />
          Pedir por WhatsApp
        </a>
      </section>

      {featuredProducts.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
                Selección
              </p>
              <h2 className="font-display text-xl text-brand-night sm:text-2xl">Destacados</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
            {featuredProducts.map((product) => (
              <StoreProductCard
                key={product.productId}
                product={product}
                onSelect={() => openProduct(product)}
              />
            ))}
          </div>
        </section>
      ) : null}

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
          {catalogProducts.length > 0 ? (
            <section className="space-y-3">
              {featuredProducts.length > 0 ? (
                <h2 className="font-display text-xl text-brand-night sm:text-2xl">Catálogo</h2>
              ) : null}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 lg:gap-4 xl:gap-5">
                {catalogProducts.map((product) => (
                  <StoreProductCard
                    key={product.productId}
                    product={product}
                    onSelect={() => openProduct(product)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {hasMore ? (
            <div ref={infiniteScrollRef} className="flex justify-center py-6">
              {loadingMore ? <Loader2 className="size-5 animate-spin text-neutral-400" /> : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
