import { useRef, useState } from "react";
import { Camera, ImageIcon, Loader2, X } from "lucide-react";
import { getReceiptModalCopy } from "@/components/cart/receipt-modal-config";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { uploadPaymentReceipt } from "@/lib/portal-profile";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function normalizeContentType(file: File): string {
  if (file.type && ALLOWED_TYPES.has(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic" || ext === "heif") return "image/heic";
  return "image/jpeg";
}

function formatAmountDisplay(amount: number): string {
  return `$ ${amount.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function ReceiptUploadModal() {
  const { user } = useAuthStore();
  const {
    showReceiptModal,
    receiptModalOptions,
    markDepositReceiptSubmitted,
    closeReceiptModal,
    backFromReceiptModal,
    setToast,
    resetValidationDismiss,
    bumpProfileReload,
    openShippingAddressModal,
  } = useUiStore();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useBodyScrollLock(showReceiptModal);

  if (!showReceiptModal) return null;

  const copy = getReceiptModalCopy(receiptModalOptions);
  const amountDisplay = formatAmountDisplay(receiptModalOptions.amount);

  const handleFileChange = (selected: File | null) => {
    setError(null);
    if (selected && selected.size > 3 * 1024 * 1024) {
      setError("La imagen es muy grande. Máximo 3 MB.");
      return;
    }
    setFile(selected);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  };

  const handleSubmit = async () => {
    if (!user || !file) {
      setError("Selecciona una imagen de tu comprobante.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const normalized = new File([file], file.name, { type: normalizeContentType(file) });
      await uploadPaymentReceipt(normalized, receiptModalOptions);
      markDepositReceiptSubmitted();
      bumpProfileReload();
      closeReceiptModal();
      resetValidationDismiss();
      if (receiptModalOptions.purpose === "shipping") {
        openShippingAddressModal();
      }
      setToast(
        receiptModalOptions.purpose === "shipping"
          ? "Comprobante enviado. Ahora confirma tu dirección de envío."
          : "Comprobante enviado. Lo estamos validando.",
      );
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(
        message.includes("Failed to fetch") || message.includes("NetworkError")
          ? "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo."
          : "No pudimos subir el comprobante. Intenta de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div className="modal-sheet animate-sheet-up relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-7 shadow-2xl sm:rounded-3xl sm:px-6 sm:pb-6 sm:pt-8">
        <button
          type="button"
          onClick={closeReceiptModal}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 sm:right-4 sm:top-4"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="pr-8 font-display text-xl font-bold text-brand-night sm:text-2xl">
          Sube tu comprobante
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-neutral-600">{copy.intro}</p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          {copy.highlightBefore}
          <strong className="text-brand-red">${receiptModalOptions.amount}</strong>
          {copy.highlightAfter}
        </p>

        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
            {copy.amountLabel}
          </p>
          <div className="mt-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-medium text-brand-night">
            {amountDisplay}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">{copy.amountHint}</p>
        </div>

        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
            Foto del comprobante
          </p>

          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-night py-3.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            <ImageIcon className="h-5 w-5" strokeWidth={1.75} />
            Elegir imagen
          </button>

          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="mt-3 flex w-full items-center justify-center gap-2 text-sm font-medium text-brand-night transition hover:text-brand-red"
          >
            <Camera className="h-4 w-4" strokeWidth={1.75} />
            Tomar foto con la cámara
          </button>

          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Usa Elegir imagen para galería o archivos. La cámara solo si quieres tomar la foto en el
            momento.
          </p>

          {preview ? (
            <img
              src={preview}
              alt="Vista previa del comprobante"
              className="mt-4 max-h-40 w-full rounded-xl border border-neutral-200 object-contain"
            />
          ) : null}
        </div>

        {error ? <p className="mt-3 text-sm text-brand-red">{error}</p> : null}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !file}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-night py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando…
              </>
            ) : (
              copy.submitLabel
            )}
          </button>
          <button
            type="button"
            onClick={backFromReceiptModal}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-neutral-300 bg-white py-3.5 text-sm font-medium text-brand-night transition hover:bg-neutral-50 disabled:opacity-50"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
