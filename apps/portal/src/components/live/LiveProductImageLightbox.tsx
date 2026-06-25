import { useEffect, useId, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ProductMediaItem } from "@emperatriz/types";

interface LiveProductImageLightboxProps {
  open: boolean;
  images?: string[];
  media?: ProductMediaItem[];
  productName: string;
  initialIndex?: number;
  onClose: () => void;
}

function resolveMedia(
  media: ProductMediaItem[] | undefined,
  images: string[] | undefined,
): ProductMediaItem[] {
  if (media?.length) return media;
  return (images ?? []).map((url) => ({ url, kind: "image" as const }));
}

function GalleryMedia({ item, productName, index }: { item: ProductMediaItem; productName: string; index: number }) {
  if (item.kind === "video") {
    return (
      <video
        src={item.url}
        className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return (
    <img
      src={item.url}
      alt={`${productName} — imagen ${index + 1}`}
      className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
    />
  );
}

export default function LiveProductImageLightbox({
  open,
  images,
  media,
  productName,
  initialIndex = 0,
  onClose,
}: LiveProductImageLightboxProps) {
  const titleId = useId();
  const gallery = resolveMedia(media, images);
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(Math.min(initialIndex, Math.max(0, gallery.length - 1)));
  }, [open, initialIndex, gallery.length]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setIndex((i) => (i <= 0 ? gallery.length - 1 : i - 1));
      if (event.key === "ArrowRight") setIndex((i) => (i >= gallery.length - 1 ? 0 : i + 1));
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, gallery.length]);

  if (!open || gallery.length === 0) return null;

  const safeIndex = Math.min(index, gallery.length - 1);
  const current = gallery[safeIndex]!;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col">
      <button
        type="button"
        aria-label="Cerrar galería"
        className="absolute inset-0 bg-black/25 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p id={titleId} className="truncate text-sm font-semibold text-white drop-shadow">
            {productName}
          </p>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative mx-auto flex min-h-0 w-full max-w-lg flex-1 items-center justify-center">
          <GalleryMedia item={current} productName={productName} index={safeIndex} />

          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Media anterior"
                onClick={() => setIndex((i) => (i <= 0 ? gallery.length - 1 : i - 1))}
                className="absolute left-0 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Media siguiente"
                onClick={() => setIndex((i) => (i >= gallery.length - 1 ? 0 : i + 1))}
                className="absolute right-0 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          ) : null}
        </div>

        {gallery.length > 1 ? (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-1.5">
              {gallery.map((item, dotIndex) => (
                <button
                  key={`${item.url}-${dotIndex}`}
                  type="button"
                  aria-label={`Ver media ${dotIndex + 1}`}
                  onClick={() => setIndex(dotIndex)}
                  className={`size-2 rounded-full transition ${
                    dotIndex === safeIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-white/80 drop-shadow">
              {safeIndex + 1} de {gallery.length}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
