import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface SearchableSelectProps {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function SearchableSelect({
  label,
  value,
  options,
  placeholder = "Seleccionar…",
  onChange,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-3 text-left text-sm text-brand-night disabled:opacity-50"
      >
        <span className={value ? "" : "text-neutral-400"}>{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-30 max-h-52 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          <div className="relative border-b border-neutral-100 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="w-full rounded-lg border border-neutral-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-red"
              autoFocus
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-neutral-500">Sin resultados</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="block w-full px-3 py-2.5 text-left text-sm hover:bg-neutral-50"
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
