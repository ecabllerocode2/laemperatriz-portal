import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, ShoppingBag, X } from "lucide-react";
import type { PortalStoreProduct } from "@emperatriz/types";
import CatalogHero from "@/components/store/CatalogHero";
import StoreProductCard from "@/components/store/StoreProductCard";
import { usePortalStoreCatalog } from "@/hooks/usePortalStoreCatalog";
import { usePortalStoreCategories } from "@/hooks/usePortalStoreCategories";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

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

  useEffect(() => {
    if (window.location.hash !== "#catalog") return;

    const scrollToCatalog = () => {
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const timer = window.setTimeout(scrollToCatalog, 120);
    window.addEventListener("hashchange", scrollToCatalog);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", scrollToCatalog);
    };
  }, []);

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

  const heroImage = featuredProducts[0]?.imageUrl ?? products.find((p) => p.imageUrl)?.imageUrl ?? null;
  const heroAlt = featuredProducts[0]?.name ?? "Colección La Emperatriz";
  const showHero = !debouncedSearch && !categoryId;

  const openProduct = useCallback(
    (product: PortalStoreProduct) => {
      navigate(`/tienda/${product.productId}`);
    },
    [navigate],
  );

  return (
    <>
      {showHero ? <CatalogHero imageUrl={heroImage} imageAlt={heroAlt} /> : null}

      <div
        id="catalog"
        className="portal-shell-store scroll-mt-20 space-y-10 py-10 sm:space-y-12 sm:py-12 lg:py-14"
      >
        {featuredProducts.length > 0 ? (
          <section className="catalog-section space-y-5">
            <div className="catalog-reveal catalog-delay-1">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.38em] text-brand-gold">
                Selección
              </p>
              <h2 className="mt-2 font-display text-2xl font-normal text-brand-night sm:text-3xl">
                Destacados
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-5">
              {featuredProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="catalog-reveal"
                  style={{ animationDelay: `${0.12 + index * 0.08}s` }}
                >
                  <StoreProductCard product={product} onSelect={() => openProduct(product)} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="catalog-section space-y-5">
          <div className="catalog-reveal catalog-delay-1">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.38em] text-neutral-400">
              Explorar
            </p>
            <h2 className="mt-2 font-display text-2xl font-normal text-brand-night sm:text-3xl">
              Catálogo
            </h2>
          </div>

          <div className="catalog-reveal catalog-delay-2 relative max-w-xl">
            <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nombre o SKU"
              className="w-full border-b border-neutral-200 bg-transparent py-3 pl-7 pr-8 text-sm text-brand-night outline-none transition placeholder:text-neutral-400 focus:border-brand-gold"
            />
            {searchInput ? (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => setSearchInput("")}
                className="absolute right-0 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:text-brand-night"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          {categoryOptions.length > 0 ? (
            <div className="catalog-reveal catalog-delay-3 live-scroll-touch flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
              <button
                type="button"
                onClick={() => setCategoryId(null)}
                className={`shrink-0 rounded-full px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] transition duration-300 ${
                  categoryId === null
                    ? "bg-brand-night text-white"
                    : "text-neutral-500 ring-1 ring-neutral-200 hover:text-brand-night"
                }`}
              >
                Todas
              </button>
              {categoryOptions.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[0.7rem] font-medium capitalize tracking-[0.06em] transition duration-300 ${
                    categoryId === category.id
                      ? "bg-brand-night text-white"
                      : "text-neutral-500 ring-1 ring-neutral-200 hover:text-brand-night"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          ) : null}
        </section>

        {error ? (
          <section className="rounded-xl border border-red-100 bg-red-50/80 px-4 py-4 text-sm text-red-800">
            {error}
            <button
              type="button"
              onClick={() => void reload()}
              className="mt-2 font-medium underline underline-offset-2"
            >
              Reintentar
            </button>
          </section>
        ) : null}

        {loading ? (
          <div className="flex min-h-[12rem] items-center justify-center text-neutral-400">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <section className="rounded-xl border border-dashed border-neutral-200 px-6 py-16 text-center">
            <ShoppingBag className="mx-auto size-8 text-neutral-300" />
            <p className="mt-4 font-display text-lg text-brand-night">No hay productos disponibles</p>
            <p className="mt-2 text-sm text-neutral-500">
              {debouncedSearch || categoryId
                ? "Prueba otra búsqueda o categoría."
                : "Vuelve pronto: el equipo está preparando novedades."}
            </p>
          </section>
        ) : (
          <>
            {catalogProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 lg:gap-5 xl:gap-6">
                {catalogProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="catalog-reveal"
                    style={{ animationDelay: `${Math.min(index * 0.04, 0.48)}s` }}
                  >
                    <StoreProductCard product={product} onSelect={() => openProduct(product)} />
                  </div>
                ))}
              </div>
            ) : null}

            {hasMore ? (
              <div ref={infiniteScrollRef} className="flex justify-center py-8">
                {loadingMore ? <Loader2 className="size-5 animate-spin text-neutral-300" /> : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
