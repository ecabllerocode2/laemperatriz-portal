import { NavLink } from "react-router-dom";
import { Package, ShoppingBag, User, Wallet } from "lucide-react";

const tabs = [
  { to: "/", label: "Compras", icon: ShoppingBag, end: true },
  { to: "/envios", label: "Envíos", icon: Package, end: false },
  { to: "/pagos", label: "Pagos", icon: Wallet, end: false },
  { to: "/perfil", label: "Perfil", icon: User, end: false },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition ${
                isActive ? "text-brand-red" : "text-neutral-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
