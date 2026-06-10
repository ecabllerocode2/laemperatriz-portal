import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

interface PortalPaymentRow {
  paymentNumber: number;
  amount: number;
  status: "pending" | "approved" | "rejected";
  conceptLabel: string;
  receiptSubmittedAt: string;
  noteId?: string;
}

function statusBadge(status: PortalPaymentRow["status"]) {
  if (status === "approved") {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
        Pagado
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
        Rechazado
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
      Por revisar
    </span>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PortalPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<PortalPaymentRow[]>("/api/portal/payments");
      setPayments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-brand-night">Pagos</h2>
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
      ) : loading ? (
        <p className="mt-6 text-center text-sm text-neutral-500">Cargando pagos…</p>
      ) : payments.length === 0 ? (
        <p className="mt-6 text-center text-sm text-neutral-500">
          Aún no tienes pagos registrados.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-100">
          {payments.map((payment) => (
            <li key={payment.paymentNumber} className="flex items-start justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-night">
                  {payment.conceptLabel}
                </p>
                <p className="text-xs text-neutral-500">
                  #{payment.paymentNumber} ·{" "}
                  {new Date(payment.receiptSubmittedAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-brand-night">
                  {formatCurrency(payment.amount)}
                </p>
                <div className="mt-1">{statusBadge(payment.status)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
