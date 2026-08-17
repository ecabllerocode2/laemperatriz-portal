import { Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { FACEBOOK_PAGE_URL } from "@/lib/social-links";
import { catalogWhatsAppUrl } from "@/lib/whatsapp-order";

export default function PortalHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/95 backdrop-blur-sm">
      <div className="portal-shell-store flex items-center justify-between gap-2 py-3 sm:gap-3">
        <Link to="/" className="flex min-h-0 min-w-0 items-center gap-2">
          <img
            src="/favicon.jpeg"
            alt="La Emperatriz"
            className="h-9 w-auto shrink-0 object-contain sm:h-10"
          />
          <span className="hidden truncate font-display text-sm text-brand-night sm:inline lg:text-base">
            Tienda La Emperatriz
          </span>
        </Link>

        <div className="flex shrink-0 items-center">
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#1877F2] hover:bg-neutral-50 sm:h-10 sm:w-10"
            aria-label="Facebook"
          >
            <Facebook className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" strokeWidth={0} />
          </a>
          <a
            href={catalogWhatsAppUrl("Hola, vengo del catálogo de La Emperatriz.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#25D366] hover:bg-neutral-50 sm:h-10 sm:w-10"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
