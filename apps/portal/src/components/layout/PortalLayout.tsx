import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import CartActivationModal from "@/components/cart/CartActivationModal";
import ReceiptUploadModal from "@/components/cart/ReceiptUploadModal";
import BottomNav from "@/components/layout/BottomNav";
import PortalHeader from "@/components/layout/PortalHeader";
import PwaInstallModal from "@/components/pwa/PwaInstallModal";
import ShippingAddressModal from "@/components/shipping/ShippingAddressModal";
import Toast from "@/components/ui/Toast";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { waitForInstallPrompt } from "@/lib/pwa-install-prompt";
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
  const {
    openCartModal,
    showCartModal,
    showShippingAddressModal,
    closeShippingAddressModal,
  } = useUiStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isLivePage = pathname === "/live";

  const depositStatus = profile?.depositStatus ?? "none";
  const displayName = profile?.name || user?.name || "Clienta";
  const { needsShippingAddress, shippingAddressDetail, reload: reloadCycle } = usePortalCycle({
    enabled: depositStatus === "approved",
    pollWhileActive: !isLivePage,
  });
  const wasLivePageRef = useRef(isLivePage);

  useEffect(() => {
    if (wasLivePageRef.current && !isLivePage) {
      void reloadCycle();
    }
    wasLivePageRef.current = isLivePage;
  }, [isLivePage, reloadCycle]);
  const [showPwaInstall, setShowPwaInstall] = useState(false);
  const { shouldOfferInstall, isIos, isAndroid, canNativeInstall, install, dismiss } =
    usePwaInstall();

  const addressRequired = needsShippingAddress;
  const showAddressModal = addressRequired || showShippingAddressModal;

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

  useEffect(() => {
    if (!profile || !shouldOfferInstall) return;
    if (showCartModal || showAddressModal) return;

    let cancelled = false;

    const prepareInstallModal = async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 800));

      if (cancelled) return;

      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.ready;
        } catch {
          /* SW no disponible */
        }
      }

      if (cancelled) return;

      await waitForInstallPrompt(4000);

      if (!cancelled) setShowPwaInstall(true);
    };

    void prepareInstallModal();

    return () => {
      cancelled = true;
    };
  }, [profile, shouldOfferInstall, showCartModal, showAddressModal]);

  return (
    <div
      className={
        isLivePage
          ? "min-h-dvh max-lg:overflow-hidden bg-black lg:bg-neutral-silk lg:pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
          : "min-h-dvh bg-neutral-silk pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
      }
    >
      <div className={isLivePage ? "max-lg:hidden" : undefined}>
        <PortalHeader firstName={firstNameFrom(displayName)} />
      </div>
      <main
        className={
          isLivePage
            ? "max-lg:p-0 lg:portal-shell-live lg:space-y-5 lg:py-5"
            : "portal-shell space-y-4 py-4 sm:space-y-5 sm:py-5"
        }
      >
        <Outlet context={{ profile, depositStatus }} />
      </main>
      <div className={isLivePage ? "max-lg:hidden" : undefined}>
        <BottomNav />
      </div>
      <CartActivationModal />
      <ReceiptUploadModal />
      <ShippingAddressModal
        open={showAddressModal}
        required={addressRequired}
        defaultPostalCode={profile?.postalCode ?? ""}
        initial={shippingAddressDetail ?? null}
        onClose={() => closeShippingAddressModal()}
        onSaved={() => {
          closeShippingAddressModal();
          void reloadCycle();
        }}
      />
      <PwaInstallModal
        open={showPwaInstall}
        isIos={isIos}
        isAndroid={isAndroid}
        canNativeInstall={canNativeInstall}
        onInstall={install}
        onDismiss={dismiss}
        onClose={() => setShowPwaInstall(false)}
      />
      <Toast />
    </div>
  );
}
