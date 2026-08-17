import { Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { FACEBOOK_PAGE_URL } from "@/lib/social-links";
import { catalogWhatsAppUrl } from "@/lib/whatsapp-order";

export default function PortalHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/60 bg-white/90 backdrop-blur-md">
      <div className="portal-shell-store flex items-center justify-between gap-4 py-4">
        <Link to="/" className="flex min-h-0 min-w-0 items-center gap-3">
          <img
            src="/favicon.jpeg"
            alt="La Emperatriz"
            className="h-8 w-auto shrink-0 object-contain sm:h-9"
          />
          <span className="font-display text-base tracking-tight text-brand-night sm:text-lg">
            La Emperatriz
          </span>
        </Link>

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
