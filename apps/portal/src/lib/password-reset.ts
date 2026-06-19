import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function requestPasswordResetEmail(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, normalized, {
    url: `${window.location.origin}/login`,
    handleCodeInApp: false,
  });
}
