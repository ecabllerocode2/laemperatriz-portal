import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import CartActivationModal from "@/components/cart/CartActivationModal";
import ReceiptUploadModal from "@/components/cart/ReceiptUploadModal";
import BottomNav from "@/components/layout/BottomNav";
import PortalHeader from "@/components/layout/PortalHeader";
import Toast from "@/components/ui/Toast";
import { usePortalProfile } from "@/hooks/usePortalProfile";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";

function firstNameFrom(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export default function PortalLayout() {
  const { user } = useAuthStore();
  const { profile } = usePortalProfile(user?.uid);
  const { openCartModal, showCartModal } = useUiStore();

  const depositStatus = profile?.depositStatus ?? "none";
  const displayName = profile?.name || user?.name || "Clienta";

  useEffect(() => {
    if (!profile || depositStatus !== "none") return;
    if (!showCartModal) openCartModal();
  }, [profile, depositStatus, showCartModal, openCartModal]);

  return (
    <div className="min-h-dvh bg-neutral-silk pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
      <PortalHeader firstName={firstNameFrom(displayName)} />
      <main className="portal-shell space-y-4 py-4 sm:space-y-5 sm:py-5">
        <Outlet context={{ profile, depositStatus }} />
      </main>
      <BottomNav />
      <CartActivationModal />
      <ReceiptUploadModal />
      <Toast />
    </div>
  );
}
