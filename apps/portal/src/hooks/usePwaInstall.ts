import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "portal-pwa-install-dismissed-at";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

export function isStandalonePwa(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIosDevice(): boolean {
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_MS;
  } catch {
    return false;
  }
}

export function dismissPwaInstallPrompt(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalonePwa());
  const [dismissed, setDismissed] = useState(() => isDismissedRecently());
  const [isIos] = useState(() => isIosDevice());

  useEffect(() => {
    if (installed) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [installed]);

  const dismiss = useCallback(() => {
    dismissPwaInstallPrompt();
    setDismissed(true);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setInstalled(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const canNativeInstall = deferredPrompt !== null;
  const shouldOfferInstall = !installed && !dismissed;

  return {
    installed,
    dismissed,
    isIos,
    canNativeInstall,
    shouldOfferInstall,
    install,
    dismiss,
  };
}
