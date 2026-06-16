import { useState } from "react";
import { Volume2, X } from "lucide-react";

interface FacebookLiveEmbedProps {
  embedUrl: string;
  title: string;
  layout?: "vertical" | "vertical-fullscreen";
}

export default function FacebookLiveEmbed({
  embedUrl,
  title,
  layout = "vertical",
}: FacebookLiveEmbedProps) {
  const isFullscreen = layout === "vertical-fullscreen";
  const [soundHintDismissed, setSoundHintDismissed] = useState(false);

  return (
    <div
      className={
        isFullscreen
          ? "size-full bg-black"
          : "mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-200 bg-black shadow-sm"
      }
    >
      <div
        className={
          isFullscreen
            ? "relative mx-auto h-full w-full max-w-[min(100%,calc(100dvh*9/16))]"
            : "relative aspect-[9/16] w-full"
        }
      >
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 size-full border-0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />

        {!soundHintDismissed ? (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-20">
            <div className="pointer-events-auto flex items-start gap-2 rounded-xl bg-black/70 px-3 py-2 text-left text-white backdrop-blur-sm">
              <Volume2 className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden />
              <p className="flex-1 text-[11px] leading-snug">
                Toca el video y pulsa el icono de volumen del reproductor para escuchar el live.
              </p>
              <button
                type="button"
                aria-label="Cerrar aviso de audio"
                onClick={() => setSoundHintDismissed(true)}
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
