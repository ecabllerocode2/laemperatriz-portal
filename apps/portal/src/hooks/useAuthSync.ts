import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { fetchPortalProfile } from "@/lib/portal-profile";
import { linkPortalCustomer } from "@/lib/portal-customer";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthUser, UserRole } from "@emperatriz/types";

async function ensureCustomerLinked(): Promise<string | undefined> {
  const profile = await fetchPortalProfile();
  if (!profile?.name || !profile.phone || !profile.postalCode) return undefined;

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
          const linkedId = await ensureCustomerLinked();
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
