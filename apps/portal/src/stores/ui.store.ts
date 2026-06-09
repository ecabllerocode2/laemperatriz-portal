import { create } from "zustand";

interface UiState {
  toast: string | null;
  showCartModal: boolean;
  showReceiptModal: boolean;
  dismissValidationBanner: boolean;
  profileReloadTick: number;
  setToast: (message: string | null) => void;
  bumpProfileReload: () => void;
  openCartModal: () => void;
  closeCartModal: () => void;
  openReceiptModal: () => void;
  closeReceiptModal: () => void;
  dismissValidation: () => void;
  resetValidationDismiss: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  showCartModal: false,
  showReceiptModal: false,
  dismissValidationBanner: false,

  profileReloadTick: 0,

  setToast: (toast) => set({ toast }),
  bumpProfileReload: () =>
    set((state) => ({ profileReloadTick: state.profileReloadTick + 1 })),
  openCartModal: () => set({ showCartModal: true }),
  closeCartModal: () => set({ showCartModal: false }),
  openReceiptModal: () => set({ showReceiptModal: true, showCartModal: false }),
  closeReceiptModal: () => set({ showReceiptModal: false }),
  dismissValidation: () => set({ dismissValidationBanner: true }),
  resetValidationDismiss: () => set({ dismissValidationBanner: false }),
}));
