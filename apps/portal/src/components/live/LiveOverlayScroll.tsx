import type { ReactNode } from "react";

interface LiveOverlayScrollProps {
  children: ReactNode;
  className?: string;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
}

/** Contenedor scrollable sobre el video. El fade va en capa aparte para no bloquear toques en iOS. */
export default function LiveOverlayScroll({
  children,
  className = "",
  scrollRef,
  onScroll,
}: LiveOverlayScrollProps) {
  return (
    <div className={`relative min-h-0 ${className}`}>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="live-scroll-touch h-full min-h-0 overflow-y-scroll overscroll-contain scrollbar-none"
      >
        <div className="flex flex-col gap-1.5 pb-1">{children}</div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/55 to-transparent"
      />
    </div>
  );
}
