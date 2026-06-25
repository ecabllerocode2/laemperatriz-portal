import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import type { ProductMediaItem } from "@emperatriz/types";

interface ProductMediaCarouselProps {
  media: ProductMediaItem[];
  productName: string;
  className?: string;
}

function CarouselSlide({
  item,
  productName,
  index,
  active,
}: {
  item: ProductMediaItem;
  productName: string;
  index: number;
  active: boolean;
}) {
  if (item.kind === "video") {
    return (
      <video
        src={item.url}
        className="size-full object-cover"
        autoPlay={active}
        muted
        loop
        playsInline
        controls={false}
        aria-label={`${productName} — video ${index + 1}`}
      />
    );
  }

  return (
    <img
      src={item.url}
      alt={`${productName} — imagen ${index + 1}`}
      className="size-full object-cover"
      loading={index === 0 ? "eager" : "lazy"}
    />
  );
}

export default function ProductMediaCarousel({
  media,
  productName,
  className = "",
}: ProductMediaCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex((value) => Math.min(value, Math.max(0, media.length - 1)));
  }, [media.length]);

  if (media.length === 0) {
    return (
      <div
        className={`flex aspect-[4/5] items-center justify-center bg-neutral-100 lg:min-h-[28rem] ${className}`.trim()}
      >
        <div className="text-center text-neutral-400">
          <ImageIcon className="mx-auto size-10" />
          <p className="mt-2 text-sm">Sin imágenes</p>
        </div>
      </div>
    );
  }

  const safeIndex = Math.min(index, media.length - 1);
  const current = media[safeIndex]!;
  const hasMultiple = media.length > 1;

  const goPrev = () => setIndex((value) => (value <= 0 ? media.length - 1 : value - 1));
  const goNext = () => setIndex((value) => (value >= media.length - 1 ? 0 : value + 1));

  return (
    <div
      className={`relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 lg:sticky lg:top-6 lg:aspect-auto lg:min-h-[28rem] lg:self-start ${className}`.trim()}
    >
      <CarouselSlide
        key={`${current.url}-${safeIndex}`}
        item={current}
        productName={productName}
        index={safeIndex}
        active
      />

      {current.kind === "video" ? (
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Video
        </span>
      ) : null}

      {hasMultiple ? (
        <>
          <button
            type="button"
            aria-label="Ver anterior"
            onClick={goPrev}
            className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Ver siguiente"
            onClick={goNext}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {media.map((item, dotIndex) => (
              <button
                key={`${item.url}-${dotIndex}`}
                type="button"
                aria-label={`Ir a media ${dotIndex + 1}`}
                onClick={() => setIndex(dotIndex)}
                className={`rounded-full transition ${
                  dotIndex === safeIndex
                    ? "size-2.5 bg-white"
                    : item.kind === "video"
                      ? "size-2 bg-white/50 ring-1 ring-white/70"
                      : "size-2 bg-white/45"
                }`}
              />
            ))}
          </div>

          <p className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
            {safeIndex + 1} / {media.length}
          </p>
        </>
      ) : null}
    </div>
  );
}
