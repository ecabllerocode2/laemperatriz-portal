import { useEffect, useRef, useState } from "react";
import type { LiveChatComment } from "@emperatriz/types";

interface LiveChatFeedProps {
  comments: LiveChatComment[];
  variant?: "overlay" | "panel";
  className?: string;
}

const SCROLL_PIN_THRESHOLD = 32;

export default function LiveChatFeed({
  comments,
  variant = "overlay",
  className = "",
}: LiveChatFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinnedToBottom, setPinnedToBottom] = useState(true);

  useEffect(() => {
    if (!pinnedToBottom) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [comments, pinnedToBottom]);

  if (comments.length === 0) return null;

  const isOverlay = variant === "overlay";

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_PIN_THRESHOLD;
    setPinnedToBottom(atBottom);
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={`live-scroll-touch touch-pan-y ${
        isOverlay
          ? "live-overlay-fade pointer-events-auto h-[min(55vh,16rem)] max-h-[min(55vh,16rem)] w-1/2 min-h-0 overflow-y-auto overscroll-contain scrollbar-none"
          : "w-full"
      } ${className}`}
    >
      <div className={`flex flex-col gap-1.5 ${isOverlay ? "min-h-min justify-end" : ""}`}>
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`max-w-full shrink-0 ${
              isOverlay
                ? "rounded-2xl bg-black/35 px-2.5 py-1.5 text-white backdrop-blur-[2px]"
                : "rounded-xl bg-neutral-50 px-3 py-2"
            }`}
          >
            <p
              className={`truncate text-[11px] font-semibold ${
                isOverlay ? "text-white/90" : "text-brand-red"
              }`}
            >
              {comment.authorName}
            </p>
            <p
              className={`mt-0.5 text-xs leading-snug ${
                isOverlay ? "text-white" : "text-brand-night"
              }`}
            >
              {comment.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
