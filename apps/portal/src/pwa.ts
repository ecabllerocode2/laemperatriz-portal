const VERSION_URL = "/version.json";
const POLL_MS = 5 * 60 * 1000;

let loadedBuildId: string | null = null;
let reloading = false;

async function fetchBuildId(): Promise<string | null> {
  try {
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { buildId?: string };
    return data.buildId ?? null;
  } catch {
    return null;
  }
}

function scheduleReload(): void {
  if (reloading) return;
  reloading = true;
  window.location.reload();
}

async function checkForAppUpdate(): Promise<void> {
  const buildId = await fetchBuildId();
  if (!buildId) return;
  if (loadedBuildId === null) {
    loadedBuildId = buildId;
    return;
  }
  if (buildId !== loadedBuildId) {
    scheduleReload();
  }
}

/** Detecta deploys nuevos (con o sin PWA) y recarga al activar una nueva versión del SW. */
export function registerPwaAutoUpdate(): void {
  void checkForAppUpdate();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void checkForAppUpdate();
  });
  window.addEventListener("focus", () => void checkForAppUpdate());
  window.setInterval(() => void checkForAppUpdate(), POLL_MS);

  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.addEventListener("controllerchange", scheduleReload);

  void navigator.serviceWorker.ready.then((registration) => {
    void registration.update();
    window.setInterval(() => void registration.update(), POLL_MS);
  });
}
