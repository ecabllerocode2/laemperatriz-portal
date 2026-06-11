import { useState } from "react";
import { ExternalLink, Radio, RefreshCw } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import FacebookLiveEmbed from "@/components/live/FacebookLiveEmbed";
import FeaturedLiveHistory from "@/components/live/FeaturedLiveHistory";
import FeaturedLiveProduct from "@/components/live/FeaturedLiveProduct";
import LiveAddToCartModal from "@/components/live/LiveAddToCartModal";
import { usePortalLive } from "@/hooks/usePortalLive";
import { createPortalLiveOrder } from "@/lib/portal-live";
import { FACEBOOK_PAGE_URL } from "@/lib/social-links";
import type { DepositStatus, PortalProfileDoc } from "@/types/portal-profile";
import { useUiStore } from "@/stores/ui.store";

interface PortalContext {
  profile: PortalProfileDoc | null;
  depositStatus: DepositStatus;
}

export default function LivePage() {
  const { depositStatus } = useOutletContext<PortalContext>();
  const { openCartModal, setToast, bumpProfileReload } = useUiStore();
  const cartActive = depositStatus === "approved";
  const { session, featuredProduct, featuredHistory, loading, error, reload } = usePortalLive(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmOrder = async (quantity: number) => {
    if (!featuredProduct || !cartActive) return;

    setSubmitting(true);
    try {
      const result = await createPortalLiveOrder({
        productId: featuredProduct.productId,
        quantity,
        ...(session?.id ? { liveSessionId: session.id } : {}),
      });
      setModalOpen(false);
      bumpProfileReload();
      setToast(
        `Agregamos ${result.quantity} × ${result.productName} a tu nota del día.`,
      );
      void reload();
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : "No se pudo agregar la pieza.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {session ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-semibold text-brand-red">
                  <span className="relative flex size-2" aria-hidden>
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-red/50" />
                    <span className="relative inline-flex size-2 rounded-full bg-brand-red" />
                  </span>
                  EN VIVO
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                  <Radio className="size-3.5" />
                  Sin transmisión
                </span>
              )}
            </div>
            <h1 className="mt-2 font-display text-xl text-brand-night sm:text-2xl">
              {session?.name ?? "Live de La Emperatriz"}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              {session?.embedUrl
                ? "Mira la transmisión aquí. Si tienes carrito activo, puedes apartar la pieza en pantalla."
                : session
                  ? "El live está activo, pero aún no hay video configurado."
                  : "Cuando el equipo inicie el live, aparecerá aquí automáticamente."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-50"
            aria-label="Actualizar estado del live"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {!cartActive ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Puedes ver el live sin carrito. Para apartar piezas,{" "}
            <button
              type="button"
              onClick={openCartModal}
              className="font-semibold underline underline-offset-2"
            >
              activa tu carrito
            </button>
            .
          </div>
        ) : null}
      </section>

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
          {error}
        </section>
      ) : null}

      {session?.embedUrl ? (
        <FacebookLiveEmbed embedUrl={session.embedUrl} title={session.name} />
      ) : (
        <section className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center sm:px-6">
          <p className="text-sm text-neutral-600">
            {loading
              ? "Buscando transmisión activa..."
              : "También puedes seguirnos en Facebook mientras preparamos el video en el portal."}
          </p>
        </section>
      )}

      {featuredProduct ? (
        <FeaturedLiveProduct
          product={featuredProduct}
          cartActive={cartActive}
          onSelect={() => setModalOpen(true)}
        />
      ) : null}

      {featuredHistory.length > 0 ? (
        <FeaturedLiveHistory
          history={featuredHistory}
          currentProductId={featuredProduct?.productId ?? null}
        />
      ) : null}

      {!featuredProduct && session ? (
        <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-center text-sm text-neutral-500 shadow-sm">
          Cuando el equipo muestre una pieza, aparecerá aquí para apartarla.
        </section>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={session?.facebookVideoUrl ?? FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-night transition hover:bg-neutral-50"
        >
          <ExternalLink className="size-4" />
          Ver en Facebook
        </a>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand-night px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-night/90"
        >
          Ir a mis compras
        </Link>
      </div>

      <LiveAddToCartModal
        open={modalOpen}
        product={featuredProduct}
        cartActive={cartActive}
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onConfirm={(quantity) => void handleConfirmOrder(quantity)}
        onActivateCart={openCartModal}
      />
    </div>
  );
}
