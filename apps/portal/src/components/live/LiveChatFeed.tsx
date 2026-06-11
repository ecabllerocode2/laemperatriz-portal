import type { LiveChatComment } from "@emperatriz/types";

interface LiveChatFeedProps {
  comments: LiveChatComment[];
  variant?: "overlay" | "panel";
  className?: string;
}

function commentOpacity(index: number, total: number): number {
  if (total <= 1) return 1;
  const progress = index / (total - 1);
  return Math.max(0.15, 0.25 + progress * 0.75);
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
      className={`pointer-events-none flex flex-col justify-end gap-1.5 overflow-hidden ${
        isOverlay ? "live-overlay-fade max-h-[42vh] w-1/2" : "max-h-full w-full"
      } ${className}`}
    >
      {comments.map((comment, index) => (
        <div
          key={comment.id}
          className={`pointer-events-auto max-w-full ${
            isOverlay
              ? "rounded-2xl bg-black/35 px-2.5 py-1.5 text-white backdrop-blur-[2px]"
              : "rounded-xl bg-neutral-50 px-3 py-2"
          }`}
          style={{ opacity: isOverlay ? commentOpacity(index, comments.length) : 1 }}
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
