import { useState } from "react";
import { Send } from "lucide-react";

interface LiveChatInputProps {
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
  onSend: (text: string) => Promise<boolean>;
}

export default function LiveChatInput({
  disabled = false,
  sending = false,
  placeholder = "Escribe algo...",
  onSend,
}: LiveChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || disabled || sending) return;

    const ok = await onSend(text);
    if (ok) setText("");
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-2 backdrop-blur-md"
    >
      <input
        type="text"
        value={text}
        maxLength={280}
        disabled={disabled || sending}
        onChange={(event) => setText(event.target.value)}
        placeholder={disabled ? "Chat no disponible" : placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/55 focus:outline-none"
      />
      <button
        type="submit"
        disabled={disabled || sending || !text.trim()}
        aria-label="Enviar comentario"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition enabled:hover:bg-white/25 disabled:opacity-40"
      >
        <Send className="size-4" />
      </button>
    </form>
  );
}
