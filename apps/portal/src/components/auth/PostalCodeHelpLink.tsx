import { useState } from "react";
import { X } from "lucide-react";
import { PERSONAL_DELIVERY_MIN_PURCHASE_MXN } from "@emperatriz/types";

export default function PostalCodeHelpLink() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
      >
        ¿Porque lo pedimos?
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="postal-code-help-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2
                id="postal-code-help-title"
                className="text-lg font-semibold text-brand-night"
              >
                ¿Por qué pedimos tu código postal?
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-neutral-600">
              <p>
                Lo usamos para saber si tu pedido puede entregarse{" "}
                <strong className="text-brand-night">en persona</strong> en tu zona o si debe
                enviarse por <strong className="text-brand-night">paquetería</strong>.
              </p>
              <p>
                Si vives en una zona con entrega personal y en el ciclo acumulas al menos{" "}
                <strong className="text-brand-night">
                  ${PERSONAL_DELIVERY_MIN_PURCHASE_MXN} MXN
                </strong>
                , te llevamos tu pedido sin costo de envío.
              </p>
              <p>
                Si no alcanzas ese mínimo, el envío se hace por paquetería y se aplica el costo
                según el tabulador vigente.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-xl bg-brand-night py-2.5 text-sm font-semibold text-white"
            >
              Entendido
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
