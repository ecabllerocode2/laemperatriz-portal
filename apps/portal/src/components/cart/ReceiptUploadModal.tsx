import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { submitDepositReceipt, uploadDepositReceipt } from "@/lib/portal-profile";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";

export default function ReceiptUploadModal() {
  const { user } = useAuthStore();
  const { showReceiptModal, closeReceiptModal, setToast, resetValidationDismiss } = useUiStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!showReceiptModal) return null;

  const handleFileChange = (selected: File | null) => {
    setError(null);
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
      const receiptUrl = await uploadDepositReceipt(user.uid, file);
      await submitDepositReceipt(user.uid, receiptUrl);
      closeReceiptModal();
      resetValidationDismiss();
      setToast("Comprobante enviado. Lo estamos validando.");
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    } catch {
      setError("No pudimos subir el comprobante. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="relative w-full max-w-md rounded-3xl bg-white px-6 pb-6 pt-8 shadow-2xl">
        <button
          type="button"
          onClick={closeReceiptModal}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-brand-night">Sube tu comprobante</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Captura o selecciona la imagen de tu transferencia de $200.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-10 transition hover:border-brand-red/40 hover:bg-red-50/30"
        >
          {preview ? (
            <img src={preview} alt="Vista previa del comprobante" className="max-h-48 rounded-lg object-contain" />
          ) : (
            <>
              <ImagePlus className="h-10 w-10 text-neutral-400" strokeWidth={1.5} />
              <span className="text-sm font-medium text-neutral-500">Toca para elegir imagen</span>
            </>
          )}
        </button>

        {error ? (
          <p className="mt-3 text-sm text-brand-red">{error}</p>
        ) : null}

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
