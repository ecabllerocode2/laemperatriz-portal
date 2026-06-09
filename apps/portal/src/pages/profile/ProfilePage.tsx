import { useOutletContext } from "react-router-dom";
import type { DepositStatus, PortalProfileDoc } from "@/types/portal-profile";

interface PortalContext {
  profile: PortalProfileDoc | null;
  depositStatus: DepositStatus;
}

const statusLabels: Record<DepositStatus, string> = {
  none: "Sin depósito",
  pending: "Comprobante en validación",
  approved: "Carrito activo",
};

export default function ProfilePage() {
  const { profile, depositStatus } = useOutletContext<PortalContext>();

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-5 shadow-sm">
      <h2 className="text-lg font-bold text-brand-night">Perfil</h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-neutral-500">Nombre</dt>
          <dd className="font-medium text-brand-night">{profile?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Correo</dt>
          <dd className="font-medium text-brand-night">{profile?.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Teléfono</dt>
          <dd className="font-medium text-brand-night">{profile?.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Código postal</dt>
          <dd className="font-medium text-brand-night">{profile?.postalCode ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Estado del carrito</dt>
          <dd className="font-medium text-brand-night">{statusLabels[depositStatus]}</dd>
        </div>
      </dl>
    </section>
  );
}
