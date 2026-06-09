import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthUser, UserRole } from "@emperatriz/types";

export function useAuthSync() {
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        clearAuth();
        return;
      }

      try {
        const idTokenResult = await firebaseUser.getIdTokenResult(true);
        const role = (idTokenResult.claims["role"] as UserRole | undefined) ?? null;
        const customerId = idTokenResult.claims["customerId"] as string | undefined;

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
