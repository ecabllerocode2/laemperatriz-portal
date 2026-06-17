import { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Radio, RefreshCw } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import FacebookLiveEmbed from "@/components/live/FacebookLiveEmbed";
import LiveSoundHint from "@/components/live/LiveSoundHint";
import LiveAddToCartModal from "@/components/live/LiveAddToCartModal";
import LiveChatFeed from "@/components/live/LiveChatFeed";
import LiveChatInput from "@/components/live/LiveChatInput";
import LiveChatPanel from "@/components/live/LiveChatPanel";
import LiveProductPanel from "@/components/live/LiveProductPanel";
import LiveProductStack from "@/components/live/LiveProductStack";
import LivePurchaseGate from "@/components/live/LivePurchaseGate";
import { useLiveChat } from "@/hooks/useLiveChat";
import { usePortalLive } from "@/hooks/usePortalLive";
import { createPortalLiveOrder } from "@/lib/portal-live";
import { normalizeProductVariants, resolveConfirmVariantId } from "@/lib/product-variants";
import { FACEBOOK_PAGE_URL } from "@/lib/social-links";
import type { PortalFeaturedProduct } from "@emperatriz/types";
import type { PortalOutletContext } from "@/components/layout/PortalLayout";
import { useUiStore } from "@/stores/ui.store";

interface PortalContext extends PortalOutletContext {}

function mergeShownProducts(
  featured: PortalFeaturedProduct | null,
  history: PortalFeaturedProduct[],
): PortalFeaturedProduct[] {
  const items: PortalFeaturedProduct[] = [];
  const seen = new Set<string>();

  if (featured) {
    items.push(featured);
    seen.add(featured.productId);
  }

  for (const product of history) {
    if (seen.has(product.productId)) continue;
    items.push(product);
    seen.add(product.productId);
  }

  return items.filter((product) => product.stock > 0);
}

export default function LivePage() {
  const { profile, canPurchase, privateSnapshot } = useOutletContext<PortalContext>();
  const { openCartModal, openReceiptModal, setToast, bumpProfileReload } = useUiStore();
  const cartActive = canPurchase;
  const [dismissedToastId, setDismissedToastId] = useState<string | null>(null);

  const handlePayThreshold = () => {
    const due = privateSnapshot?.thresholdBlock?.depositDue ?? 0;
    if (due <= 0) return;
    openReceiptModal({ purpose: "notes", amount: due });
  };
  const { session, featuredProduct, featuredHistory, loading, refreshing, error, reload } =
    usePortalLive(true);
  const authorName = profile?.name ?? "Clienta";
  const [embedRefreshKey, setEmbedRefreshKey] = useState(0);
  const { comments, chatActive, sending, error: chatError, sendComment } = useLiveChat(
    session?.id,
    authorName,
  );
  const [selectedProduct, setSelectedProduct] = useState<PortalFeaturedProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const shownProducts = useMemo(
    () => mergeShownProducts(featuredProduct, featuredHistory).slice(-30),
    [featuredProduct, featuredHistory],
  );

  const orderableFeaturedProduct =
    featuredProduct && featuredProduct.stock > 0 ? featuredProduct : null;

  const handleRefreshLive = () => {
    setEmbedRefreshKey((key) => key + 1);
    void reload();
  };

  const openProductModal = (product: PortalFeaturedProduct) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleConfirmOrder = async (
    quantity: number,
    variant: { id: string; color: string; size: string },
  ) => {
    if (!selectedProduct || !cartActive) return;

    setSubmitting(true);
    try {
      const variants = normalizeProductVariants(selectedProduct);
      const resolvedVariantId = resolveConfirmVariantId(variants, variant.id);
      if (!resolvedVariantId) {
        setToast("Elige color o talla para continuar.");
        return;
      }
      const picked = variants.find((item) => item.id === resolvedVariantId) ?? variant;

      const result = await createPortalLiveOrder({
        productId: selectedProduct.productId,
        quantity,
        variantId: picked.id,
        variantColor: picked.color,
        variantSize: picked.size,
        ...(session?.id ? { liveSessionId: session.id } : {}),
      });
      setModalOpen(false);
      setSelectedProduct(null);
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

  const liveBadge = session ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70" />
        <span className="relative inline-flex size-2 rounded-full bg-white" />
      </span>
      EN VIVO
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
      <Radio className="size-3.5" />
      Sin transmisión
    </span>
  );

  const videoBlock = session?.embedUrl ? (
    <FacebookLiveEmbed
      key={`${session.id}-${embedRefreshKey}`}
      embedUrl={session.embedUrl}
      title={session.name}
      layout="vertical-fullscreen"
      sessionKey={session.id}
      embedRefreshKey={embedRefreshKey}
    />
  ) : (
    <div className="flex size-full items-center justify-center px-6 text-center text-sm text-white/80">
      {loading
        ? "Buscando transmisión activa..."
        : "Cuando el equipo inicie el live, el video aparecerá aquí."}
    </div>
  );

  return (
    <>
      {/* Móvil: estilo TikTok — video + chat izquierda + productos derecha */}
      <div className="fixed inset-0 z-10 flex flex-col bg-black lg:hidden">
        <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 bg-gradient-to-b from-black/80 to-transparent px-3 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Link
            to="/"
            className="flex size-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
            aria-label="Volver a compras"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="min-w-0 flex-1 px-1 text-center">
            {liveBadge}
            <p className="mt-1 truncate text-xs font-medium text-white/90">
              {session?.name ?? "Live de La Emperatriz"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshLive}
            disabled={refreshing}
            className="flex size-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm disabled:opacity-50"
            aria-label="Actualizar live"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        <LivePurchaseGate
          canPurchase={cartActive}
          blockReason={privateSnapshot?.blockReason ?? "cart_opening_required"}
          thresholdBlock={privateSnapshot?.thresholdBlock ?? null}
          toast={privateSnapshot?.toast ?? null}
          dismissedToastId={dismissedToastId}
          onDismissToast={() => {
            if (privateSnapshot?.toast) {
              setDismissedToastId(privateSnapshot.toast.id);
            }
          }}
          onActivateCart={openCartModal}
          onPayThreshold={handlePayThreshold}
          variant="overlay"
        />

        <div className="relative z-0 min-h-0 flex-1">
          <div className="absolute inset-0 z-0">{videoBlock}</div>

          <div className="absolute inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 flex items-end justify-between gap-2 px-2">
            <LiveChatFeed comments={comments} variant="overlay" className="pl-0.5" />
            <LiveProductStack
              products={shownProducts}
              currentProductId={orderableFeaturedProduct?.productId ?? null}
              onSelect={openProductModal}
              variant="overlay"
              className="pr-0.5"
            />
          </div>

          {session?.embedUrl ? (
            <LiveSoundHint
              sessionKey={session.id}
              className={
                cartActive
                  ? "top-[calc(5rem+env(safe-area-inset-top))]"
                  : "top-[calc(7.25rem+env(safe-area-inset-top))]"
              }
            />
          ) : null}
        </div>

        <div className="relative z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          {chatError ? (
            <p className="mb-2 text-center text-xs text-red-300">{chatError}</p>
          ) : null}
          <LiveChatInput
            disabled={!session || !chatActive}
            sending={sending}
            onSend={sendComment}
          />
        </div>

        {error ? (
          <p className="absolute inset-x-4 bottom-32 z-30 rounded-xl bg-red-600/90 px-3 py-2 text-center text-xs text-white">
            {error}
          </p>
        ) : null}
      </div>

      {/* Escritorio: video + productos + chat */}
      <div className="hidden space-y-5 lg:block">
        <section className="flex items-start justify-between gap-4">
          <div className="min-w-0">
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
            <h1 className="mt-2 font-display text-2xl text-brand-night">
              {session?.name ?? "Live de La Emperatriz"}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Transmisión vertical con chat en vivo y piezas para apartar.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshLive}
            disabled={refreshing}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:bg-white disabled:opacity-50"
            aria-label="Actualizar estado del live"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </section>

        <LivePurchaseGate
          canPurchase={cartActive}
          blockReason={privateSnapshot?.blockReason ?? "cart_opening_required"}
          thresholdBlock={privateSnapshot?.thresholdBlock ?? null}
          toast={privateSnapshot?.toast ?? null}
          dismissedToastId={dismissedToastId}
          onDismissToast={() => {
            if (privateSnapshot?.toast) {
              setDismissedToastId(privateSnapshot.toast.id);
            }
          }}
          onActivateCart={openCartModal}
          onPayThreshold={handlePayThreshold}
          variant="inline"
        />

        {error ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
            {error}
          </section>
        ) : null}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_minmax(0,18rem)]">
          <div className="xl:sticky xl:top-24">
            {session?.embedUrl ? (
              <FacebookLiveEmbed
                embedUrl={session.embedUrl}
                title={session.name}
                layout="vertical"
                sessionKey={session.id}
                embedRefreshKey={embedRefreshKey}
              />
            ) : (
              <section className="flex aspect-[9/16] max-w-sm items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm text-neutral-500">
                {loading
                  ? "Buscando transmisión activa..."
                  : "El video aparecerá aquí cuando el equipo configure la transmisión."}
              </section>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={session?.facebookVideoUrl ?? FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-brand-night transition hover:bg-neutral-50"
              >
                <ExternalLink className="size-4" />
                Ver en Facebook
              </a>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-brand-night px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-night/90"
              >
                Ir a mis compras
              </Link>
            </div>
          </div>

          <LiveProductPanel
            products={shownProducts}
            currentProductId={orderableFeaturedProduct?.productId ?? null}
            cartActive={cartActive}
            onSelect={openProductModal}
          />

          <LiveChatPanel
            comments={comments}
            chatActive={chatActive}
            sending={sending}
            error={chatError}
            onSend={sendComment}
          />
        </div>
      </div>

      <LiveAddToCartModal
        open={modalOpen}
        product={selectedProduct}
        cartActive={cartActive}
        submitting={submitting}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={(quantity, variant) => void handleConfirmOrder(quantity, variant)}
        onActivateCart={openCartModal}
      />
    </>
  );
}
