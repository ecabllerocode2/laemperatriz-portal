export type FacebookLiveEmbedLayout = "vertical" | "vertical-fullscreen";

interface FacebookLiveEmbedProps {
  embedUrl: string;
  title: string;
  layout?: FacebookLiveEmbedLayout;
}

export default function FacebookLiveEmbed({
  embedUrl,
  title,
  layout = "vertical",
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
          className={`absolute inset-0 size-full border-0 ${isFullscreen ? "pointer-events-none" : ""}`}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
