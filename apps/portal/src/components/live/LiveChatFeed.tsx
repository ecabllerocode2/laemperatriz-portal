import type { LiveChatComment } from "@emperatriz/types";

interface LiveChatFeedProps {
  comments: LiveChatComment[];
  variant?: "overlay" | "panel";
  className?: string;
}

export default function LiveChatFeed({
  comments,
  variant = "overlay",
  className = "",
}: LiveChatFeedProps) {
  if (comments.length === 0) return null;

  const isOverlay = variant === "overlay";

  return (
    <div
      className={`flex flex-col justify-end gap-1.5 ${
        isOverlay
          ? "live-overlay-fade pointer-events-auto max-h-[55vh] w-1/2 overflow-y-auto overscroll-contain scrollbar-none"
          : "max-h-full w-full overflow-hidden"
      } ${className}`}
    >
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
  );
}
