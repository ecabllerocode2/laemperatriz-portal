import { apiRequest } from "@/lib/api";
import { uploadToR2 } from "@/lib/r2";
import type { PortalProfileDoc } from "@/types/portal-profile";

export const DEPOSIT_AMOUNT = 200;

interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export async function fetchPortalProfile(): Promise<PortalProfileDoc | null> {
  return apiRequest<PortalProfileDoc | null>("/api/portal/profile");
}

export async function uploadDepositReceipt(file: File): Promise<string> {
  const contentType = file.type || "image/jpeg";
  const { uploadUrl, publicUrl } = await apiRequest<UploadUrlResponse>(
    "/api/portal/deposit-receipt/upload-url",
    {
      method: "POST",
      body: JSON.stringify({ filename: file.name, contentType }),
    },
  );

  await uploadToR2(uploadUrl, file);
  return publicUrl;
}

export async function submitDepositReceipt(receiptUrl: string): Promise<void> {
  await apiRequest("/api/portal/deposit-receipt/submit", {
    method: "POST",
    body: JSON.stringify({ receiptUrl }),
  });
}
