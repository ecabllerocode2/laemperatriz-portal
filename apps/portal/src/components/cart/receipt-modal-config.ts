import { DEPOSIT_AMOUNT } from "@/lib/portal-profile";

export type ReceiptPaymentPurpose = "cart" | "notes" | "shipping";

export interface ReceiptModalOptions {
  purpose: ReceiptPaymentPurpose;
  amount: number;
  noteId?: string;
}

export const DEFAULT_RECEIPT_MODAL_OPTIONS: ReceiptModalOptions = {
  purpose: "cart",
  amount: DEPOSIT_AMOUNT,
};

interface ReceiptModalCopy {
  intro: string;
  highlightBefore: string;
  highlightAfter: string;
  amountLabel: string;
  amountHint: string;
  submitLabel: string;
}

export function getReceiptModalCopy(options: ReceiptModalOptions): ReceiptModalCopy {
  const amount = options.amount;
  const amountFmt = `$${amount}`;

  switch (options.purpose) {
    case "notes":
      return {
        intro: `Transfiere ${amountFmt} y adjunta la captura. Al enviar, cerramos este paso y verás el aviso de validación.`,
        highlightBefore: "Sube la captura de tus ",
        highlightAfter:
          " para liquidar tus notas. En cuanto el equipo la valide, tu saldo quedará actualizado.",
        amountLabel: `PAGO DE NOTAS — ${amountFmt}`,
        amountHint: "Monto correspondiente a las notas pendientes de tu ciclo actual.",
        submitLabel: "Enviar pago de notas",
      };
    case "shipping":
      return {
        intro: `Transfiere ${amountFmt} y adjunta la captura. Al enviar, cerramos este paso y verás el aviso de validación.`,
        highlightBefore: "Sube la captura de tus ",
        highlightAfter:
          " para pagar tu envío. En cuanto el equipo la valide, procesamos tu paquete.",
        amountLabel: `PAGO DE ENVÍO — ${amountFmt}`,
        amountHint: "Monto del envío de tu ciclo. Incluye el costo de paquetería acordado.",
        submitLabel: "Enviar pago de envío",
      };
    default:
      return {
        intro: `Transfiere ${amountFmt} y adjunta la captura. Al enviar, cerramos este paso y verás el aviso de validación.`,
        highlightBefore: "¡Estás a un comprobante de distancia! Sube la captura de tus ",
        highlightAfter:
          " y en cuanto el equipo la valide tu carrito queda activo para comprar en el live y armar tu envío.",
        amountLabel: `TU ACTIVACION — ${amountFmt}`,
        amountHint:
          "Monto fijo de apertura del ciclo. Lo vuelves a solicitar cada 7 días solo al abrir un carrito nuevo, cuando ya no tengas envío activo.",
        submitLabel: "¡Activar mi carrito!",
      };
  }
}
