import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { DepositStatus, PortalProfileDoc } from "@/types/portal-profile";

export const DEPOSIT_AMOUNT = 200;

const profileRef = (uid: string) => doc(db, "portal_profiles", uid);

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
  const ext = file.name.split(".").pop() ?? "jpg";
  const objectRef = ref(storage, `deposit-receipts/${uid}/${Date.now()}.${ext}`);
  await uploadBytes(objectRef, file);
  return getDownloadURL(objectRef);
}

export async function submitDepositReceipt(uid: string, receiptUrl: string): Promise<void> {
  await updateDoc(profileRef(uid), {
    depositStatus: "pending" satisfies DepositStatus,
    receiptUrl,
    receiptSubmittedAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });
}
