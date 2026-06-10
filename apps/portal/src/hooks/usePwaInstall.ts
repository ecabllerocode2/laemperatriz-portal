import { useCallback, useEffect, useState } from "react";
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  subscribeInstallPrompt,
} from "@/lib/pwa-install-prompt";

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

export function isAndroidDevice(): boolean {
  return /Android/i.test(navigator.userAgent);
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
  const [hasPrompt, setHasPrompt] = useState(() => getDeferredInstallPrompt() !== null);
  const [installed, setInstalled] = useState(() => isStandalonePwa());
  const [dismissed, setDismissed] = useState(() => isDismissedRecently());
  const [isIos] = useState(() => isIosDevice());
  const [isAndroid] = useState(() => isAndroidDevice());

  useEffect(() => {
    if (installed) return;

    const sync = () => {
      setHasPrompt(getDeferredInstallPrompt() !== null);
      setInstalled(isStandalonePwa());
    };

    sync();
    const unsubscribe = subscribeInstallPrompt(sync);

    const onInstalled = () => {
      clearDeferredInstallPrompt();
      setInstalled(true);
      setHasPrompt(false);
    };

    window.addEventListener("appinstalled", onInstalled);

    return () => {
      unsubscribe();
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [installed]);

  const dismiss = useCallback(() => {
    dismissPwaInstallPrompt();
    setDismissed(true);
  }, []);

  const install = useCallback(async () => {
    const prompt = getDeferredInstallPrompt();
    if (!prompt) return false;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    clearDeferredInstallPrompt();
    setHasPrompt(false);

    if (outcome === "accepted") {
      setInstalled(true);
      return true;
    }
    return false;
  }, []);

  const canNativeInstall = hasPrompt;
  const shouldOfferInstall = !installed && !dismissed;

  return {
    installed,
    dismissed,
    isIos,
    isAndroid,
    canNativeInstall,
    shouldOfferInstall,
    install,
    dismiss,
  };
}
