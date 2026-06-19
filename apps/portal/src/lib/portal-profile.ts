import type { ReceiptModalOptions } from "@/components/cart/receipt-modal-config";
import { apiRequest } from "@/lib/api";
import type { PortalProfileDoc, PortalProfileUpdatePayload } from "@/types/portal-profile";

export const DEPOSIT_AMOUNT = 200;

export async function fetchPortalProfile(): Promise<PortalProfileDoc | null> {
  return apiRequest<PortalProfileDoc | null>("/api/portal/profile");
}

export async function updatePortalProfile(payload: PortalProfileUpdatePayload): Promise<void> {
  await apiRequest("/api/portal/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("No se pudo leer la imagen."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

export async function uploadPaymentReceipt(
  file: File,
  options: ReceiptModalOptions,
): Promise<void> {
  const data = await fileToBase64(file);
  await apiRequest("/api/portal/deposit-receipt", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "image/jpeg",
      data,
      purpose: options.purpose,
      amount: options.amount,
      noteId: options.noteId,
    }),
  });
}

/** @deprecated Use uploadPaymentReceipt */
export async function uploadDepositReceipt(file: File): Promise<void> {
  return uploadPaymentReceipt(file, { purpose: "cart", amount: DEPOSIT_AMOUNT });
}
