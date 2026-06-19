import { MapPin } from "lucide-react";
import type { ShippingAddressDetail } from "@/types/portal-profile";

interface ShippingAddressPreviewProps {
  formatted: string | null;
  detail?: ShippingAddressDetail | null;
  missing?: boolean;
  onEdit: () => void;
}

function compactLine(detail: ShippingAddressDetail): string {
  return `${detail.street} ${detail.exteriorNumber}, ${detail.neighborhood}, CP ${detail.postalCode}`;
}

export default function ShippingAddressPreview({
  formatted,
  detail,
  missing,
  onEdit,
}: ShippingAddressPreviewProps) {
  const preview = detail ? compactLine(detail) : formatted;

  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex w-full items-start gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-left transition hover:border-brand-red/30 hover:bg-white"
    >
      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          Dirección de envío
        </span>
        <span className="mt-0.5 block truncate text-xs text-brand-night">
          {missing ? "Toca para capturar tu dirección" : preview ?? "Toca para editar"}
        </span>
      </span>
      <span className="shrink-0 text-[11px] font-semibold text-brand-red">
        {missing ? "Capturar" : "Editar"}
      </span>
    </button>
  );
}
