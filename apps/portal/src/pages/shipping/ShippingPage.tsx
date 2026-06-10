import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import LiveBanner from "@/components/home/LiveBanner";
import LiquidationAlertsBanner from "@/components/shipping/LiquidationAlertsBanner";
import ShipmentCard from "@/components/shipping/ShipmentCard";
import ShipmentDetailModal from "@/components/shipping/ShipmentDetailModal";
import { usePortalCycle } from "@/hooks/usePortalCycle";
import type { DepositStatus, PortalProfileDoc } from "@/types/portal-profile";
import { useUiStore } from "@/stores/ui.store";

interface PortalContext {
  profile: PortalProfileDoc | null;
  depositStatus: DepositStatus;
}

export default function ShippingPage() {
  const { depositStatus } = useOutletContext<PortalContext>();
  const cartActive = depositStatus === "approved";
  const { cycle, loading, error, reload } = usePortalCycle(cartActive);
  const { openReceiptModal } = useUiStore();
  const [detailOpen, setDetailOpen] = useState(false);

  const shipment = cycle?.shipment;
  const inProgress =
    cycle &&
    (cycle.status === "deposit_confirmed" ||
      cycle.status === "active" ||
      cycle.status === "closing_new" ||
      cycle.status === "closing_freq" ||
      cycle.status === "penalty_freq");

  const handlePayShipping = () => {
    if (!cycle?.shipment?.canPayShipping) return;
    openReceiptModal({
      purpose: "shipping",
      amount: cycle.shipment.projectedShippingCost,
    });
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
            {inProgress ? (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-brand-red">
                {shipment ? "1 envío" : "En curso"}
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
        ) : loading && !cycle ? (
          <p className="mt-6 text-center text-sm text-neutral-500">Cargando envíos…</p>
        ) : !cycle || !inProgress ? (
          <p className="mt-6 text-center text-sm text-neutral-500">
            {cartActive
              ? "Aún no tienes un envío activo. Aparecerá aquí al confirmar tu depósito."
              : "Activa tu carrito con el depósito para ver tus envíos."}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              En curso
            </p>
            <ShipmentCard
              cycle={cycle}
              onOpenDetail={() => setDetailOpen(true)}
              onPayShipping={handlePayShipping}
            />
          </div>
        )}
      </section>

      {cycle && detailOpen ? (
        <ShipmentDetailModal
          open={detailOpen}
          cycle={cycle}
          onClose={() => setDetailOpen(false)}
          onPayShipping={handlePayShipping}
        />
      ) : null}
    </>
  );
}
