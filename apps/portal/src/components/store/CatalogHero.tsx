import { useEffect, useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { CatalogHeroSlide } from "@/lib/catalog-hero-slides";
import { pickNextHeroSlideIndex } from "@/lib/catalog-hero-slides";
import { openCatalogSection } from "@/lib/catalog-scroll";

const HERO_ROTATION_MS = 2000;

interface CatalogHeroProps {
  slides: CatalogHeroSlide[];
}

export default function CatalogHero({ slides }: CatalogHeroProps) {
  const [slideIndex, setSlideIndex] = useState(0);

  const safeSlides = useMemo(
    () => slides.filter((slide) => Boolean(slide.imageUrl)),
    [slides],
  );

  const slidesKey = useMemo(
    () => safeSlides.map((slide) => slide.categoryId).join("|"),
    [safeSlides],
  );

  useEffect(() => {
    setSlideIndex(0);
  }, [slidesKey]);

  useEffect(() => {
    if (safeSlides.length <= 1) return;

    const timer = window.setInterval(() => {
      setSlideIndex((current) => pickNextHeroSlideIndex(safeSlides, current));
    }, HERO_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [safeSlides.length, slidesKey]);

  const currentSlide = safeSlides[slideIndex] ?? safeSlides[0] ?? null;

  return (
    <section className="relative overflow-hidden bg-brand-red text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_20%_40%,rgba(255,255,255,0.14),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/4 size-80 rounded-full bg-black/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />

      <div className="portal-shell-store relative grid min-h-[min(88vh,760px)] grid-cols-1 items-center gap-10 py-14 sm:gap-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        <div className="flex flex-col justify-center lg:pr-4">
          <h1 className="catalog-reveal catalog-delay-1 font-display text-[2.35rem] font-normal leading-[1.02] tracking-tight sm:text-5xl lg:text-[3.35rem] xl:text-6xl">
            Colección
            <br />
            <span className="text-white">La Emperatriz</span>
          </h1>
          <p className="catalog-reveal catalog-delay-2 mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-[0.9375rem]">
            Piezas seleccionadas para ti. Explora el catálogo y pide la tuya por WhatsApp.
          </p>
          <button
            type="button"
            onClick={openCatalogSection}
            className="catalog-reveal catalog-delay-3 group mt-10 inline-flex min-h-0 min-w-0 items-center gap-4 self-start"
          >
            <span className="flex size-11 items-center justify-center rounded-full border border-white/40 transition duration-500 group-hover:border-white group-hover:bg-white/10">
              <ArrowDown className="size-4 text-white transition duration-500 group-hover:translate-y-0.5" />
            </span>
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-white/80 transition duration-500 group-hover:text-white sm:text-xs">
              Ver catálogo
            </span>
          </button>
        </div>

        <div className="catalog-reveal-arch relative mx-auto flex w-full max-w-[17rem] items-end justify-center sm:max-w-xs lg:max-w-sm xl:max-w-md">
          <div className="catalog-arch-glow absolute inset-x-6 bottom-0 h-24 rounded-full bg-white/20 blur-2xl" />
          <div className="catalog-arch-frame relative aspect-[3/4] w-full overflow-hidden">
            {currentSlide ? (
              <img
                key={`${currentSlide.categoryId}-${currentSlide.imageUrl}`}
                src={currentSlide.imageUrl}
                alt={currentSlide.imageAlt}
                className="catalog-hero-slide size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-black/25">
                <img
                  src="/favicon.jpeg"
                  alt="La Emperatriz"
                  className="catalog-arch-image size-24 rounded-full object-cover opacity-80"
                />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-red/40 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
