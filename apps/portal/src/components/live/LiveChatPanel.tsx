import LiveChatFeed from "@/components/live/LiveChatFeed";
import type { LiveChatComment } from "@emperatriz/types";
import { Send } from "lucide-react";
import { useState } from "react";

interface LiveChatPanelProps {
  comments: LiveChatComment[];
  chatActive: boolean;
  sending: boolean;
  error: string | null;
  onSend: (text: string) => Promise<boolean>;
}

export default function LiveChatPanel({
  comments,
  chatActive,
  sending,
  error,
  onSend,
}: LiveChatPanelProps) {
  const [text, setText] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || !chatActive || sending) return;
    const ok = await onSend(text);
    if (ok) setText("");
  };

  return (
    <section className="flex h-[min(32rem,calc(100vh-12rem))] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-4 py-3">
        <h2 className="font-display text-lg text-brand-night">Chat del live</h2>
        <p className="text-xs text-neutral-500">
          {chatActive
            ? "Los comentarios se borran al terminar la transmisión."
            : "El chat no está activo."}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">
            Sé la primera en comentar durante el live.
          </p>
        ) : (
          <LiveChatFeed comments={comments} variant="panel" />
        )}
      </div>

      {error ? <p className="px-4 pb-2 text-xs text-brand-red">{error}</p> : null}

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="border-t border-neutral-100 p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
          <input
            type="text"
            value={text}
            maxLength={280}
            disabled={!chatActive || sending}
            onChange={(event) => setText(event.target.value)}
            placeholder={chatActive ? "Escribe un comentario..." : "Chat cerrado"}
            className="min-w-0 flex-1 bg-transparent text-sm text-brand-night placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!chatActive || sending || !text.trim()}
            aria-label="Enviar comentario"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-red text-white transition enabled:hover:bg-brand-red-dark disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </section>
  );
}
