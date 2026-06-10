/** Comprueba actualizaciones del SW y recarga al activar una nueva versión. */
export function registerPwaAutoUpdate(): void {
  if (!("serviceWorker" in navigator)) return;

  const reloadOnControllerChange = () => {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  };

  reloadOnControllerChange();

  void navigator.serviceWorker.ready.then((registration) => {
    const intervalMs = 60 * 60 * 1000;
    window.setInterval(() => {
      void registration.update();
    }, intervalMs);
  });
}
