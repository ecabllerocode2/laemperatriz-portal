import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadDepositReceipt } from "@/lib/portal-profile";
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

export default function ReceiptUploadModal() {
  const { user } = useAuthStore();
  const { showReceiptModal, closeReceiptModal, setToast, resetValidationDismiss, bumpProfileReload } =
    useUiStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!showReceiptModal) return null;

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
      await uploadDepositReceipt(normalized);
      bumpProfileReload();
      closeReceiptModal();
      resetValidationDismiss();
      setToast("Comprobante enviado. Lo estamos validando.");
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
      <div className="modal-sheet animate-sheet-up relative w-full max-w-md rounded-t-3xl bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-7 shadow-2xl sm:rounded-3xl sm:px-6 sm:pb-6 sm:pt-8">
        <button
          type="button"
          onClick={closeReceiptModal}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 sm:right-4 sm:top-4"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-brand-night sm:text-xl">Sube tu comprobante</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Captura o selecciona la imagen de tu transferencia de $200.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 transition hover:border-brand-red/40 hover:bg-red-50/30 sm:py-10"
        >
          {preview ? (
            <img
              src={preview}
              alt="Vista previa del comprobante"
              className="max-h-40 w-full rounded-lg object-contain sm:max-h-48"
            />
          ) : (
            <>
              <ImagePlus className="h-10 w-10 text-neutral-400" strokeWidth={1.5} />
              <span className="text-sm font-medium text-neutral-500">Toca para elegir imagen</span>
            </>
          )}
        </button>

        {error ? <p className="mt-3 text-sm text-brand-red">{error}</p> : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !file}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-night py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando…
            </>
          ) : (
            "Enviar comprobante"
          )}
        </button>
      </div>
    </div>
  );
}
