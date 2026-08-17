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
    <div className="min-h-dvh bg-white">
      <PortalHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
