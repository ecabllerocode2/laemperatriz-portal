import { ArrowDownUp, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import ValidationBanner from "@/components/cart/ValidationBanner";
import LiveBanner from "@/components/home/LiveBanner";
import type { DepositStatus, PortalProfileDoc } from "@/types/portal-profile";

interface PortalContext {
  profile: PortalProfileDoc | null;
  depositStatus: DepositStatus;
}

export default function PurchasesPage() {
  const { depositStatus } = useOutletContext<PortalContext>();
  const cartActive = depositStatus === "approved";

  return (
    <>
      {depositStatus === "pending" ? <ValidationBanner /> : null}

      <LiveBanner cartActive={cartActive} />

      <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base font-bold text-brand-night sm:text-lg">Mis compras</h2>
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-brand-red">
              0 compras
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-brand-night hover:bg-neutral-50"
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              Ordenar
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-brand-night hover:bg-neutral-50"
              aria-label="Actualizar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-6 pb-2 text-center text-sm text-neutral-500 sm:mt-8 sm:pb-4">
          Aún no hay compras registradas a tu nombre.
        </p>
      </section>
    </>
  );
}
