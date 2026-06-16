import { useEffect, useId, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface LiveProductImageLightboxProps {
  open: boolean;
  images: string[];
  productName: string;
  initialIndex?: number;
  onClose: () => void;
}

export default function LiveProductImageLightbox({
  open,
  images,
  productName,
  initialIndex = 0,
  onClose,
}: LiveProductImageLightboxProps) {
  const titleId = useId();
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(Math.min(initialIndex, Math.max(0, images.length - 1)));
  }, [open, initialIndex, images.length]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
      if (event.key === "ArrowRight") setIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, images.length]);

  if (!open || images.length === 0) return null;

  const safeIndex = Math.min(index, images.length - 1);
  const current = images[safeIndex]!;

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
          <img
            src={current}
            alt={`${productName} — imagen ${safeIndex + 1}`}
            className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
          />

          {images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Imagen anterior"
                onClick={() => setIndex((i) => (i <= 0 ? images.length - 1 : i - 1))}
                className="absolute left-0 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Imagen siguiente"
                onClick={() => setIndex((i) => (i >= images.length - 1 ? 0 : i + 1))}
                className="absolute right-0 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-1.5">
              {images.map((url, dotIndex) => (
                <button
                  key={url}
                  type="button"
                  aria-label={`Ver imagen ${dotIndex + 1}`}
                  onClick={() => setIndex(dotIndex)}
                  className={`size-2 rounded-full transition ${
                    dotIndex === safeIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-white/80 drop-shadow">
              {safeIndex + 1} de {images.length}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
