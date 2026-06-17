import type { SaleOrigin } from "@emperatriz/types";

const LABELS: Record<SaleOrigin, string> = {
  live: "Live",
  store: "Tienda",
};

const STYLES: Record<SaleOrigin, string> = {
  live: "bg-brand-red/10 text-brand-red ring-brand-red/20",
  store: "bg-brand-night/8 text-brand-night ring-brand-night/10",
};

interface SaleOriginBadgeProps {
  origin?: SaleOrigin | undefined;
  className?: string;
}

export default function SaleOriginBadge({ origin, className = "" }: SaleOriginBadgeProps) {
  const resolved = origin ?? "live";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${STYLES[resolved]} ${className}`}
    >
      {resolved === "live" ? (
        <span className="relative flex size-1.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-red/60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-brand-red" />
        </span>
      ) : null}
      {LABELS[resolved]}
    </span>
  );
}
