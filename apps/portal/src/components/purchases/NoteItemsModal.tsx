import { X } from "lucide-react";
import type { PortalSaleNote } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";

interface NoteItemsModalProps {
  note: PortalSaleNote | null;
  onClose: () => void;
}

export default function NoteItemsModal({ note, onClose }: NoteItemsModalProps) {
  if (!note) return null;

  const itemCount = note.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div className="modal-sheet animate-sheet-up relative max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-7 shadow-2xl sm:rounded-3xl sm:px-6 sm:pb-6 sm:pt-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="pr-8 font-display text-xl font-bold text-brand-night">Artículos de la nota</h2>
        <p className="mt-1 text-sm text-neutral-500">
          {itemCount} {itemCount === 1 ? "artículo" : "artículos"} · Total{" "}
          {formatCurrency(note.total)}
        </p>

        <ul className="mt-5 divide-y divide-neutral-100">
          {note.items.map((item, index) => (
            <li key={`${item.productId}-${index}`} className="flex gap-3 py-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-night">{item.name}</p>
                <p className="text-xs text-neutral-500">
                  {item.quantity} pz · {formatCurrency(item.unitPrice)} c/u
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-brand-night">
                {formatCurrency(item.subtotal)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
