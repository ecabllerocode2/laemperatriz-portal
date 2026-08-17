import { Outlet } from "react-router-dom";
import PortalHeader from "@/components/layout/PortalHeader";
import type { PortalPrivateSnapshot } from "@emperatriz/types";
import type { DepositStatus, PortalProfileDoc } from "@/types/portal-profile";

/** Conservado para páginas del portal que quedan fuera de las rutas del catálogo. */
export interface PortalOutletContext {
  profile: PortalProfileDoc | null;
  depositStatus: DepositStatus;
  canPurchase: boolean;
  privateSnapshot: PortalPrivateSnapshot | null;
  isGuest: boolean;
}

export default function PortalLayout() {
  return (
    <div className="min-h-dvh bg-neutral-silk">
      <PortalHeader />
      <main className="portal-shell-store space-y-4 py-4 sm:space-y-5 sm:py-5 lg:space-y-6 lg:py-6">
        <Outlet />
      </main>
    </div>
  );
}
