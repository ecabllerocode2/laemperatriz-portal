import type { LucideIcon } from "lucide-react";

interface AuthInputProps {
  id: string;
  label: string;
  icon: LucideIcon;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  highlighted?: boolean;
  error?: string | undefined;
  registration?: React.InputHTMLAttributes<HTMLInputElement>;
}

export default function AuthInput({
  id,
  label,
  icon: Icon,
  type = "text",
  placeholder,
  readOnly,
  highlighted,
  error,
  registration,
}: AuthInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-brand-night">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-400"
          strokeWidth={1.75}
        />
        <input
          id={id}
          type={type}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-brand-red/20 ${
            highlighted
              ? "border-red-100 bg-red-50/60 text-brand-night"
              : "border-neutral-200 bg-white focus:border-brand-red"
          } ${readOnly ? "cursor-default" : ""}`}
          {...registration}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-brand-red">{error}</p> : null}
    </div>
  );
}
