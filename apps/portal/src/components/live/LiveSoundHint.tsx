import { useCallback, useState } from "react";
import { Volume2, X } from "lucide-react";

interface LiveSoundHintProps {
  sessionKey?: string | null;
  className?: string;
}

function readDismissed(sessionKey: string | null | undefined): boolean {
  if (!sessionKey || typeof window === "undefined") return false;
  return sessionStorage.getItem(`live-audio-hint:${sessionKey}`) === "1";
}

export default function LiveSoundHint({ sessionKey = null, className = "" }: LiveSoundHintProps) {
  const [dismissed, setDismissed] = useState(() => readDismissed(sessionKey));

  const dismiss = useCallback(() => {
    setDismissed(true);
    if (sessionKey) {
      sessionStorage.setItem(`live-audio-hint:${sessionKey}`, "1");
    }
  }, [sessionKey]);

  if (dismissed) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-40 flex justify-center px-4 ${className}`}
    >
      <div className="pointer-events-auto flex max-w-xs items-start gap-2 rounded-xl border border-white/20 bg-black/85 px-3 py-2.5 text-left text-white shadow-lg backdrop-blur-sm">
        <Volume2 className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold leading-snug">Activa el audio</p>
          <p className="mt-0.5 text-[11px] leading-snug text-white/85">
            Toca el video y pulsa el icono de volumen del reproductor de Facebook.
          </p>
        </div>
        <button
          type="button"
          aria-label="Entendido, ocultar aviso"
          onClick={dismiss}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
