import { Facebook, LogOut, MessageCircle, ShoppingBag } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth.store";

interface PortalHeaderProps {
  firstName: string;
}

export default function PortalHeader({ firstName }: PortalHeaderProps) {
  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    await signOut(auth);
    clearAuth();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-100 bg-white">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <img src="/favicon.jpeg" alt="La Emperatriz" className="h-10 w-auto object-contain" />

        <p className="hidden flex-1 text-center text-sm font-medium text-brand-night sm:block">
          ¡Bienvenido! {firstName}
        </p>

        <div className="flex items-center gap-0.5">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#1877F2] hover:bg-neutral-50"
            aria-label="Facebook"
          >
            <Facebook className="h-5 w-5" fill="currentColor" strokeWidth={0} />
          </a>
          <a
            href="https://m.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#0084FF] hover:bg-neutral-50"
            aria-label="Messenger"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-night hover:bg-neutral-50"
            aria-label="Carrito"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-50"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="px-4 pb-3 text-center text-sm font-medium text-brand-night sm:hidden">
        ¡Bienvenido! {firstName}
      </p>
    </header>
  );
}
