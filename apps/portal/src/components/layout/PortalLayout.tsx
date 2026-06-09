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
    <div className="min-h-screen bg-neutral-pearl pb-24">
      <PortalHeader firstName={firstNameFrom(displayName)} />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-4">
        <Outlet context={{ profile, depositStatus }} />
      </main>
      <BottomNav />
      <CartActivationModal />
      <ReceiptUploadModal />
      <Toast />
    </div>
  );
}
