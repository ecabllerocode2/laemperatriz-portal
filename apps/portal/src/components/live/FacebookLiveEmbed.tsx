interface FacebookLiveEmbedProps {
  embedUrl: string;
  title: string;
}

export default function FacebookLiveEmbed({ embedUrl, title }: FacebookLiveEmbedProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-black shadow-sm">
      <div className="relative aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
