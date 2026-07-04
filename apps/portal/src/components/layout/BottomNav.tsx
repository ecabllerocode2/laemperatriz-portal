import { NavLink } from "react-router-dom";
import { Package, ShoppingBag, Store, User, Wallet } from "lucide-react";
import { loginPathWithReturn } from "@/lib/auth-redirect";

const tabs = [
  { to: "/", label: "Tienda", icon: Store, end: true, public: true },
  { to: "/compras", label: "Compras", icon: ShoppingBag, end: false, public: false },
  { to: "/envios", label: "Envíos", icon: Package, end: false, public: false },
  { to: "/pagos", label: "Pagos", icon: Wallet, end: false, public: false },
  { to: "/perfil", label: "Perfil", icon: User, end: false, public: false },
];

interface BottomNavProps {
  isGuest?: boolean;
}

export default function BottomNav({ isGuest = false }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {tabs.map(({ to, label, icon: Icon, end, public: isPublic }) => {
          const guestTarget = isGuest && !isPublic ? loginPathWithReturn(to) : to;

          return (
            <NavLink
              key={to}
              to={guestTarget}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-0.5 py-2 text-[10px] font-medium transition sm:text-[11px] ${
                  isActive ? "text-brand-red" : "text-neutral-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
