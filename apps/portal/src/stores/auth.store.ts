import { create } from "zustand";
import type { AuthUser } from "@emperatriz/types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  identityVerified: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  setIdentityVerified: (verified: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  identityVerified: false,

  setAuth: (user, token) => set({ user, token, isLoading: false }),
  setIdentityVerified: (identityVerified) => set({ identityVerified }),
  clearAuth: () =>
    set({ user: null, token: null, isLoading: false, identityVerified: false }),
}));
