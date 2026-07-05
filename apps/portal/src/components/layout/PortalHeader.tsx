import { Facebook, LogIn, LogOut, MessageCircle, ShoppingBag, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import NotificationsBell from "@/components/layout/NotificationsBell";
import { loginPathWithReturn, registerPathWithReturn } from "@/lib/auth-redirect";
import { auth } from "@/lib/firebase";
import { FACEBOOK_PAGE_URL } from "@/lib/social-links";
import { useAuthStore } from "@/stores/auth.store";

export type PortalShellVariant = "default" | "store" | "live";

interface PortalHeaderProps {
  firstName: string;
  isGuest?: boolean;
  notificationsEnabled?: boolean;
  shellVariant?: PortalShellVariant;
}

function shellClassName(variant: PortalShellVariant): string {
  if (variant === "store") return "portal-shell-store";
  if (variant === "live") return "portal-shell-live";
  return "portal-shell";
}

export default function PortalHeader({
  firstName,
  isGuest = false,
  notificationsEnabled = true,
  shellVariant = "default",
}: PortalHeaderProps) {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const returnTo = typeof window !== "undefined" ? window.location.pathname : "/";

  const handleLogout = async () => {
    await signOut(auth);
    clearAuth();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/95 backdrop-blur-sm">
      <div className={`${shellClassName(shellVariant)} flex items-center justify-between gap-2 py-3 sm:gap-3`}>
        <img
          src="/favicon.jpeg"
          alt="La Emperatriz"
          className="h-9 w-auto shrink-0 object-contain sm:h-10"
        />

        <p className="min-w-0 flex-1 truncate text-center text-xs font-medium text-brand-night sm:text-sm">
          {isGuest ? "Explora la tienda" : `¡Bienvenido! ${firstName}`}
        </p>

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
            href="https://m.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#0084FF] hover:bg-neutral-50 sm:h-10 sm:w-10"
            aria-label="Messenger"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </a>
          {isGuest ? (
            <>
              <Link
                to={loginPathWithReturn(returnTo)}
                className="flex h-9 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-brand-night hover:bg-neutral-50 sm:h-10 sm:px-3 sm:text-sm"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
              <Link
                to={registerPathWithReturn(returnTo)}
                className="flex h-9 items-center gap-1 rounded-full bg-brand-red px-2.5 text-xs font-semibold text-white hover:bg-brand-red-dark sm:h-10 sm:px-3 sm:text-sm"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Registro</span>
              </Link>
            </>
          ) : (
            <>
              <NotificationsBell enabled={notificationsEnabled} />
              <button
                type="button"
                className="hidden h-9 w-9 items-center justify-center rounded-full text-brand-night hover:bg-neutral-50 sm:flex sm:h-10 sm:w-10"
                aria-label="Carrito"
              >
                <ShoppingBag className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-50 sm:h-10 sm:w-10"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
