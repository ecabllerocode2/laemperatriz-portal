import { Download, Share, Smartphone, X } from "lucide-react";

interface PwaInstallModalProps {
  open: boolean;
  isIos: boolean;
  canNativeInstall: boolean;
  onInstall: () => Promise<boolean>;
  onDismiss: () => void;
  onClose: () => void;
}

function IosInstructions() {
  return (
    <ol className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
      <li className="flex gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-night text-xs font-bold text-white">
          1
        </span>
        <span>
          Abre este portal en <strong className="text-brand-night">Safari</strong> (en iPhone no
          funciona desde Chrome ni Facebook).
        </span>
      </li>
      <li className="flex gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-night text-xs font-bold text-white">
          2
        </span>
        <span className="flex flex-wrap items-center gap-1">
          Toca el botón <Share className="inline h-4 w-4 text-brand-night" aria-hidden />{" "}
          <strong className="text-brand-night">Compartir</strong> en la barra inferior.
        </span>
      </li>
      <li className="flex gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-night text-xs font-bold text-white">
          3
        </span>
        <span>
          Elige <strong className="text-brand-night">Agregar a pantalla de inicio</strong> y confirma.
        </span>
      </li>
    </ol>
  );
}

export default function PwaInstallModal({
  open,
  isIos,
  canNativeInstall,
  onInstall,
  onDismiss,
  onClose,
}: PwaInstallModalProps) {
  if (!open) return null;

  const handleDismiss = () => {
    onDismiss();
    onClose();
  };

  const handleInstall = async () => {
    const accepted = await onInstall();
    if (accepted) onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div
        className="modal-sheet animate-sheet-up relative w-full max-w-md rounded-t-3xl bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-7 shadow-2xl sm:rounded-3xl sm:px-6 sm:pb-6 sm:pt-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
      >
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 sm:right-4 sm:top-4"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-brand-red">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="pwa-install-title"
              className="text-xl font-bold leading-tight tracking-tight text-brand-night sm:text-2xl"
            >
              Instala La Emperatriz en tu celular
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Acceso rápido como app, sin buscar el enlace cada vez.
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          Al tenerla en tu pantalla de inicio entras directo a tus compras, pagos y envíos. Muy
          pronto podrás recibir avisos de liquidación y envío desde la app.
        </p>

        {isIos ? (
          <IosInstructions />
        ) : canNativeInstall ? (
          <p className="mt-4 text-sm text-neutral-600">
            Toca el botón de abajo y confirma la instalación en tu navegador.
          </p>
        ) : (
          <p className="mt-4 text-sm text-neutral-600">
            Abre este portal en <strong className="text-brand-night">Chrome</strong> o{" "}
            <strong className="text-brand-night">Edge</strong> en tu celular y usa el menú del
            navegador → <strong className="text-brand-night">Instalar aplicación</strong>.
          </p>
        )}

        <div className="mt-6 space-y-3">
          {!isIos && canNativeInstall ? (
            <button
              type="button"
              onClick={() => void handleInstall()}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-night py-3.5 text-sm font-semibold text-white transition hover:bg-black"
            >
              <Download className="h-4 w-4" />
              Instalar app
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full rounded-full border border-neutral-200 py-3.5 text-sm font-semibold text-brand-night transition hover:bg-neutral-50"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
