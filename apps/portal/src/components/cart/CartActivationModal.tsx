import { X } from "lucide-react";
import { DEPOSIT_AMOUNT } from "@/lib/portal-profile";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useUiStore } from "@/stores/ui.store";

export default function CartActivationModal() {
  const { showCartModal, dismissCartActivation, openReceiptModal } = useUiStore();

  useBodyScrollLock(showCartModal);

  if (!showCartModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div
        className="modal-sheet animate-sheet-up relative w-full max-w-md rounded-t-3xl bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-7 shadow-2xl sm:rounded-3xl sm:px-6 sm:pb-6 sm:pt-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
      >
        <button
          type="button"
          onClick={dismissCartActivation}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 sm:right-4 sm:top-4"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="cart-modal-title"
          className="pr-10 text-xl font-bold leading-tight tracking-tight text-brand-night sm:pr-8 sm:text-2xl"
        >
          ¡Activa tu carrito con ${DEPOSIT_AMOUNT}!
        </h2>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
          <p>
            Un paso y ya compras en el live como en tienda: apartas piezas y armamos tu envío del
            ciclo.
          </p>
          <p>
            Los <strong className="text-brand-night">${DEPOSIT_AMOUNT}</strong> son tu pase para
            abrir el carrito del ciclo: te apartamos joyas en vivo, liquidas con descuentos y al
            cierre armamos tu envío de <strong className="text-brand-night">7 días</strong>. Solo lo
            repites cuando empiezas un ciclo nuevo (sin envío abierto).
          </p>
          <p>
            <strong className="text-brand-night">Transfiere, sube tu comprobante y listo.</strong>{" "}
            En cuanto lo validemos, entras al live con tu carrito activo.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => openReceiptModal()}
            className="w-full rounded-full bg-brand-night py-3.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            Ya transferí — subir comprobante
          </button>
          <button
            type="button"
            onClick={dismissCartActivation}
            className="w-full rounded-full border border-neutral-300 bg-white py-3.5 text-sm font-medium text-brand-night transition hover:bg-neutral-50"
          >
            Lo hago en un momento
          </button>
        </div>
      </div>
    </div>
  );
}
