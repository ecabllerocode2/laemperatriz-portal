import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import type { PortalCycle } from "@emperatriz/types";
import LiveBanner from "@/components/home/LiveBanner";
import LiquidationAlertsBanner from "@/components/shipping/LiquidationAlertsBanner";
import ShipmentCard from "@/components/shipping/ShipmentCard";
import ShipmentDetailModal from "@/components/shipping/ShipmentDetailModal";
import { usePortalShipments } from "@/hooks/usePortalShipments";
import { confirmFreeSettlement } from "@/lib/portal-cycle";
import type { DepositStatus, PortalProfileDoc } from "@/types/portal-profile";
import { useUiStore } from "@/stores/ui.store";

interface PortalContext {
  profile: PortalProfileDoc | null;
  depositStatus: DepositStatus;
}

export default function ShippingPage() {
  const { depositStatus } = useOutletContext<PortalContext>();
  const cartActive = depositStatus === "approved";
  const { active, history, loading, error, reload } = usePortalShipments(cartActive);
  const { openReceiptModal, bumpProfileReload } = useUiStore();
  const [detailCycle, setDetailCycle] = useState<PortalCycle | null>(null);
  const [confirming, setConfirming] = useState(false);

  const shipment = active?.shipment;

  const handlePayShipping = (cycle: PortalCycle) => {
    if (!cycle.shipment?.canPayShipping) return;
    openReceiptModal({
      purpose: "shipping",
      amount: cycle.shipment.projectedShippingCost,
    });
  };

  const handleConfirmFree = async (cycle: PortalCycle) => {
    if (!cycle.shipment?.canConfirmFreeShipping || confirming) return;
    setConfirming(true);
    try {
      await confirmFreeSettlement();
      bumpProfileReload();
      await reload();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <LiveBanner cartActive={cartActive} />

      {shipment?.liquidationAlerts?.length ? (
        <LiquidationAlertsBanner alerts={shipment.liquidationAlerts} />
      ) : null}

      <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-brand-night sm:text-lg">Mis envíos</h2>
            {active ? (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-brand-red">
                1 en curso
              </span>
            ) : null}
            {history.length > 0 ? (
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                {history.length} anteriores
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-brand-night hover:bg-neutral-50 disabled:opacity-50"
            aria-label="Actualizar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error ? (
          <p className="mt-6 text-center text-sm text-brand-red">{error}</p>
        ) : loading && !active && history.length === 0 ? (
          <p className="mt-6 text-center text-sm text-neutral-500">Cargando envíos…</p>
        ) : !active && history.length === 0 ? (
          <p className="mt-6 text-center text-sm text-neutral-500">
            {cartActive
              ? "Aún no tienes envíos. Aparecerá aquí al confirmar tu depósito."
              : "Activa tu carrito con el depósito para ver tus envíos."}
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {active ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  En curso
                </p>
                <ShipmentCard
                  cycle={active}
                  onOpenDetail={() => setDetailCycle(active)}
                  onPayShipping={() => handlePayShipping(active)}
                  onConfirmFree={() => void handleConfirmFree(active)}
                />
              </div>
            ) : null}

            {history.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Historial
                </p>
                {history.map((item) => (
                  <ShipmentCard
                    key={item.cycleId}
                    cycle={item.cycle}
                    readOnly
                    onOpenDetail={() => setDetailCycle(item.cycle)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>

      {detailCycle ? (
        <ShipmentDetailModal
          open
          cycle={detailCycle}
          onClose={() => setDetailCycle(null)}
          {...(detailCycle.shipment?.canPayShipping
            ? { onPayShipping: () => handlePayShipping(detailCycle) }
            : {})}
          {...(detailCycle.shipment?.canConfirmFreeShipping
            ? { onConfirmFree: () => void handleConfirmFree(detailCycle) }
            : {})}
        />
      ) : null}
    </>
  );
}
