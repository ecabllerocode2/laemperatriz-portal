import { Facebook } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { FACEBOOK_PAGE_URL } from "@/lib/social-links";
import { catalogWhatsAppUrl } from "@/lib/whatsapp-order";

const navItemClass =
  "text-[0.7rem] font-medium uppercase tracking-[0.18em] transition duration-300 sm:text-xs";

export default function PortalHeader() {
  const location = useLocation();
  const onCatalog = location.pathname === "/" && location.hash === "#catalog";

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/60 bg-white/90 backdrop-blur-md">
      <div className="portal-shell-store flex items-center justify-between gap-3 py-4 sm:gap-4">
        <Link to="/" className="flex min-h-0 min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <img
            src="/favicon.jpeg"
            alt="La Emperatriz"
            className="h-8 w-auto shrink-0 object-contain sm:h-9"
          />
          <span className="hidden font-display text-base tracking-tight text-brand-night sm:inline sm:text-lg">
            La Emperatriz
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-5 sm:gap-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${navItemClass} ${isActive && !onCatalog ? "text-brand-night" : "text-neutral-400 hover:text-brand-night"}`
            }
          >
            Inicio
          </NavLink>
          <Link
            to="/#catalog"
            className={`${navItemClass} ${onCatalog ? "text-brand-night" : "text-neutral-400 hover:text-brand-night"}`}
          >
            Catálogo
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition duration-300 hover:bg-neutral-50 hover:text-[#1877F2]"
            aria-label="Facebook"
          >
            <Facebook className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          </a>
          <a
            href={catalogWhatsAppUrl("Hola, vengo del catálogo de La Emperatriz.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition duration-300 hover:bg-neutral-50 hover:text-[#25D366]"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
