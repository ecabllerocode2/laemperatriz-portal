import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import LiveProductImageLightbox from "@/components/live/LiveProductImageLightbox";
import NoteTotalBreakdown from "@/components/purchases/NoteTotalBreakdown";
import SaleOriginBadge from "@/components/purchases/SaleOriginBadge";
import type { PortalSaleNote, SaleNoteItem } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";
import { fetchStoreProduct } from "@/lib/portal-store";

interface NoteItemsModalProps {
  note: PortalSaleNote | null;
  onClose: () => void;
}

interface GalleryState {
  images: string[];
  productName: string;
}

function fallbackImages(item: SaleNoteItem): string[] {
  return item.imageUrl ? [item.imageUrl] : [];
}

export default function NoteItemsModal({ note, onClose }: NoteItemsModalProps) {
  const [gallery, setGallery] = useState<GalleryState | null>(null);

  useEffect(() => {
    if (!note) setGallery(null);
  }, [note]);

  if (!note) return null;

  const itemCount = note.items.reduce((sum, item) => sum + item.quantity, 0);
  const pending = note.status === "pending_payment";

  const openGallery = async (item: SaleNoteItem) => {
    const fallback = fallbackImages(item);
    if (fallback.length > 0) {
      setGallery({ images: fallback, productName: item.name });
    }

    try {
      const product = await fetchStoreProduct(item.productId);
      const images =
        product.imageUrls.length > 0
          ? product.imageUrls
          : product.imageUrl
            ? [product.imageUrl]
            : fallback;
      if (images.length > 0) {
        setGallery({ images, productName: item.name });
      }
    } catch {
      /* mantener fallback si existe */
    }
  };

  return (
    <>
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
            {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
          </p>
          <NoteTotalBreakdown note={note} showDiscount={pending} className="mt-3" />

          <ul className="mt-5 divide-y divide-neutral-100">
            {note.items.map((item, index) => {
              const hasImage = Boolean(item.imageUrl);
              return (
                <li key={`${item.productId}-${index}`} className="flex gap-3 py-3">
                  <button
                    type="button"
                    aria-label={`Ver fotos de ${item.name}`}
                    onClick={() => void openGallery(item)}
                    className="group relative size-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    ) : null}
                    {hasImage ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                        <span className="flex size-7 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
                          <ZoomIn className="size-3.5" />
                        </span>
                      </span>
                    ) : (
                      <span className="flex size-full items-center justify-center text-neutral-400">
                        <ZoomIn className="size-4" />
                      </span>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-brand-night">{item.name}</p>
                      <SaleOriginBadge origin={item.saleOrigin} />
                    </div>
                    <p className="text-xs text-neutral-500">
                      {item.quantity} pz
                      {item.isFreeReplacement ? (
                        <> · Gratis · Reposición</>
                      ) : (
                        <> · {formatCurrency(item.unitPrice)} c/u</>
                      )}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-brand-night">
                    {item.isFreeReplacement ? (
                      <span className="text-emerald-700">Gratis</span>
                    ) : (
                      formatCurrency(item.subtotal)
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <LiveProductImageLightbox
        open={gallery !== null}
        images={gallery?.images ?? []}
        productName={gallery?.productName ?? ""}
        onClose={() => setGallery(null)}
      />
    </>
  );
}
