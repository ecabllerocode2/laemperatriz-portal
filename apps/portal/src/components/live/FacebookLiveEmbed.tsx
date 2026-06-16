import LiveSoundHint from "@/components/live/LiveSoundHint";

interface FacebookLiveEmbedProps {
  embedUrl: string;
  title: string;
  layout?: "vertical" | "vertical-fullscreen";
  sessionKey?: string | null;
}

export default function FacebookLiveEmbed({
  embedUrl,
  title,
  layout = "vertical",
  sessionKey = null,
}: FacebookLiveEmbedProps) {
  const isFullscreen = layout === "vertical-fullscreen";

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

        {!isFullscreen ? (
          <LiveSoundHint sessionKey={sessionKey} className="top-1/2 -translate-y-1/2" />
        ) : null}
      </div>
    </div>
  );
}
