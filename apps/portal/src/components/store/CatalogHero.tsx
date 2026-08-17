import { ArrowDown } from "lucide-react";

interface CatalogHeroProps {
  imageUrl: string | null;
  imageAlt?: string;
}

export default function CatalogHero({ imageUrl, imageAlt = "Colección La Emperatriz" }: CatalogHeroProps) {
  const scrollToCatalog = () => {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden bg-brand-night text-neutral-pearl">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_50%,rgba(201,168,76,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 size-72 rounded-full bg-brand-red/10 blur-3xl"
        aria-hidden
      />

      <div className="portal-shell-store relative grid min-h-[min(88vh,760px)] grid-cols-1 items-center gap-10 py-14 sm:gap-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        <div className="flex flex-col justify-center lg:pr-4">
          <h1 className="catalog-reveal catalog-delay-1 font-display text-[2.35rem] font-normal leading-[1.02] tracking-tight sm:text-5xl lg:text-[3.35rem] xl:text-6xl">
            Colección
            <br />
            <span className="bg-gradient-to-r from-brand-gold via-[#e8d5a3] to-brand-gold bg-clip-text text-transparent">
              La Emperatriz
            </span>
          </h1>
          <p className="catalog-reveal catalog-delay-2 mt-5 max-w-md text-sm leading-relaxed text-neutral-pearl/55 sm:text-[0.9375rem]">
            Piezas seleccionadas para ti. Explora el catálogo y pide la tuya por WhatsApp.
          </p>
          <button
            type="button"
            onClick={scrollToCatalog}
            className="catalog-reveal catalog-delay-3 group mt-10 inline-flex min-h-0 min-w-0 items-center gap-4 self-start"
          >
            <span className="flex size-11 items-center justify-center rounded-full border border-brand-gold/35 transition duration-500 group-hover:border-brand-gold group-hover:bg-brand-gold/10">
              <ArrowDown className="size-4 text-brand-gold transition duration-500 group-hover:translate-y-0.5" />
            </span>
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-neutral-pearl/70 transition duration-500 group-hover:text-brand-gold sm:text-xs">
              Ver catálogo
            </span>
          </button>
        </div>

        <div className="catalog-reveal-arch relative mx-auto flex w-full max-w-[17rem] items-end justify-center sm:max-w-xs lg:max-w-sm xl:max-w-md">
          <div className="catalog-arch-glow absolute inset-x-6 bottom-0 h-24 rounded-full bg-brand-gold/15 blur-2xl" />
          <div className="catalog-arch-frame relative aspect-[3/4] w-full overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt}
                className="catalog-arch-image size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-[#252545]">
                <img
                  src="/favicon.jpeg"
                  alt="La Emperatriz"
                  className="catalog-arch-image size-24 rounded-full object-cover opacity-80"
                />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-night/35 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
