import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { linkPortalCustomer } from "@/lib/portal-customer";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthUser, UserRole } from "@emperatriz/types";
import type { PortalProfileDoc } from "@/types/portal-profile";

async function ensureCustomerLinked(uid: string): Promise<string | undefined> {
  const snap = await getDoc(doc(db, "portal_profiles", uid));
  if (!snap.exists()) return undefined;

  const profile = snap.data() as PortalProfileDoc;
  try {
    return await linkPortalCustomer({
      name: profile.name,
      phone: profile.phone,
      postalCode: profile.postalCode,
    });
  } catch {
    return undefined;
  }
}

export function useAuthSync() {
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        clearAuth();
        return;
      }

      try {
        let idTokenResult = await firebaseUser.getIdTokenResult(true);
        let customerId = idTokenResult.claims["customerId"] as string | undefined;

        if (!customerId) {
          const linkedId = await ensureCustomerLinked(firebaseUser.uid);
          if (linkedId) {
            idTokenResult = await firebaseUser.getIdTokenResult(true);
            customerId = linkedId;
          }
        }

        const role = (idTokenResult.claims["role"] as UserRole | undefined) ?? null;

        const user: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          role,
          name: firebaseUser.displayName ?? firebaseUser.email ?? "",
          ...(customerId ? { customerId } : {}),
        };

        setAuth(user, idTokenResult.token);
      } catch {
        clearAuth();
      }
    });

    return () => unsubscribe();
  }, [setAuth, clearAuth]);
}
