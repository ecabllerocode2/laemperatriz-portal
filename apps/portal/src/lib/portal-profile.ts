import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { apiRequest } from "@/lib/api";
import { uploadToR2 } from "@/lib/r2";
import type { DepositStatus, PortalProfileDoc } from "@/types/portal-profile";

export const DEPOSIT_AMOUNT = 200;

const profileRef = (uid: string) => doc(db, "portal_profiles", uid);

interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export async function getPortalProfile(uid: string): Promise<PortalProfileDoc | null> {
  const snap = await getDoc(profileRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as PortalProfileDoc;
}

export async function createPortalProfile(
  uid: string,
  data: Pick<PortalProfileDoc, "email" | "name" | "phone" | "postalCode">,
): Promise<void> {
  await setDoc(profileRef(uid), {
    uid,
    ...data,
    depositStatus: "none" satisfies DepositStatus,
    depositAmount: DEPOSIT_AMOUNT,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function uploadDepositReceipt(uid: string, file: File): Promise<string> {
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

export async function submitDepositReceipt(uid: string, receiptUrl: string): Promise<void> {
  await updateDoc(profileRef(uid), {
    depositStatus: "pending" satisfies DepositStatus,
    receiptUrl,
    receiptSubmittedAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });
}
