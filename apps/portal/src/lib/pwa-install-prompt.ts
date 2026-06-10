/** Captura global del evento beforeinstallprompt (debe registrarse antes de React). */

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function capturePwaInstallPrompt(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    notifyListeners();
  });
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredInstallPrompt;
}

export function clearDeferredInstallPrompt(): void {
  deferredInstallPrompt = null;
  notifyListeners();
}

export function subscribeInstallPrompt(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function waitForInstallPrompt(timeoutMs = 5000): Promise<boolean> {
  if (deferredInstallPrompt) return true;

  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;

    const unsubscribe = subscribeInstallPrompt(() => {
      if (deferredInstallPrompt) {
        window.clearInterval(interval);
        unsubscribe();
        resolve(true);
      }
    });

    const interval = window.setInterval(() => {
      if (deferredInstallPrompt) {
        window.clearInterval(interval);
        unsubscribe();
        resolve(true);
        return;
      }
      if (Date.now() >= deadline) {
        window.clearInterval(interval);
        unsubscribe();
        resolve(false);
      }
    }, 150);
  });
}
