import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthBackToStore() {
  return (
    <Link
      to="/"
      className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-brand-night shadow-sm ring-1 ring-neutral-200/80 backdrop-blur-sm transition hover:bg-white sm:left-6 sm:top-6"
      style={{ top: "max(1rem, env(safe-area-inset-top))" }}
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden />
      Volver a la tienda
    </Link>
  );
}
