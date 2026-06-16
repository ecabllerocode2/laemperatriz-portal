import { useEffect, useRef, useState } from "react";
import type { LiveChatComment } from "@emperatriz/types";
import LiveOverlayScroll from "@/components/live/LiveOverlayScroll";

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

  if (!isOverlay) {
    return (
      <div className={`w-full space-y-1.5 ${className}`}>
        {comments.map((comment) => (
          <div key={comment.id} className="max-w-full shrink-0 rounded-xl bg-neutral-50 px-3 py-2">
            <p className="truncate text-[11px] font-semibold text-brand-red">{comment.authorName}</p>
            <p className="mt-0.5 text-xs leading-snug text-brand-night">{comment.text}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <LiveOverlayScroll
      scrollRef={scrollRef}
      onScroll={handleScroll}
      className={`h-[min(52vh,17rem)] w-[48%] max-w-[11rem] shrink-0 ${className}`}
    >
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="max-w-full shrink-0 rounded-2xl bg-black/35 px-2.5 py-1.5 text-white backdrop-blur-[2px]"
        >
          <p className="truncate text-[11px] font-semibold text-white/90">{comment.authorName}</p>
          <p className="mt-0.5 text-xs leading-snug text-white">{comment.text}</p>
        </div>
      ))}
    </LiveOverlayScroll>
  );
}
