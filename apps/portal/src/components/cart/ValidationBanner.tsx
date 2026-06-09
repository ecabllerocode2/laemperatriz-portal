import { X } from "lucide-react";
import { DEPOSIT_AMOUNT } from "@/lib/portal-profile";
import { useUiStore } from "@/stores/ui.store";

export default function ValidationBanner() {
  const { dismissValidationBanner, dismissValidation } = useUiStore();

  if (dismissValidationBanner) return null;

  return (
    <div className="relative rounded-2xl border border-amber-200/80 bg-[#FFF8E7] px-4 py-4 pr-10">
      <button
        type="button"
        onClick={dismissValidation}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-amber-100/60"
        aria-label="Cerrar aviso"
      >
        <X className="h-4 w-4" />
      </button>
      <h2 className="font-display text-lg leading-tight text-brand-night">
        Tu pago está en proceso de validación
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        Recibimos tu comprobante de{" "}
        <span className="font-semibold text-brand-red">${DEPOSIT_AMOUNT}</span>. En cuanto el
        equipo lo apruebe se abre tu cuenta y podrás comprar en el live. Esta pantalla se
        actualiza sola; no necesitas recargar la página.
      </p>
    </div>
  );
}
