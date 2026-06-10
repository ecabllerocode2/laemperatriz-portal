import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import CartActivationModal from "@/components/cart/CartActivationModal";
import ReceiptUploadModal from "@/components/cart/ReceiptUploadModal";
import BottomNav from "@/components/layout/BottomNav";
import PortalHeader from "@/components/layout/PortalHeader";
import ShippingAddressModal from "@/components/shipping/ShippingAddressModal";
import Toast from "@/components/ui/Toast";
import { usePortalCycle } from "@/hooks/usePortalCycle";
import { usePortalProfile } from "@/hooks/usePortalProfile";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";

function firstNameFrom(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export default function PortalLayout() {
  const { user } = useAuthStore();
  const { profile, isLoading } = usePortalProfile(user?.uid);
  const { openCartModal, showCartModal } = useUiStore();
  const navigate = useNavigate();

  const depositStatus = profile?.depositStatus ?? "none";
  const displayName = profile?.name || user?.name || "Clienta";
  const { needsShippingAddress, shippingAddressDetail, reload: reloadCycle } = usePortalCycle(
    depositStatus === "approved",
  );
  const [addressDismissed, setAddressDismissed] = useState(false);

  const showAddressModal = needsShippingAddress && !addressDismissed;

  useEffect(() => {
    if (needsShippingAddress) setAddressDismissed(false);
  }, [needsShippingAddress]);

  useEffect(() => {
    if (isLoading || !user) return;
    if (!profile) {
      navigate("/completar-registro", { replace: true });
    }
  }, [isLoading, user, profile, navigate]);

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
      <ShippingAddressModal
        open={showAddressModal}
        defaultPostalCode={profile?.postalCode ?? ""}
        initial={shippingAddressDetail ?? null}
        onSaved={() => {
          setAddressDismissed(true);
          void reloadCycle();
        }}
      />
      <Toast />
    </div>
  );
}
