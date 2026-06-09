import { create } from "zustand";

interface UiState {
  toast: string | null;
  showCartModal: boolean;
  showReceiptModal: boolean;
  dismissValidationBanner: boolean;
  setToast: (message: string | null) => void;
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

  setToast: (toast) => set({ toast }),
  openCartModal: () => set({ showCartModal: true }),
  closeCartModal: () => set({ showCartModal: false }),
  openReceiptModal: () => set({ showReceiptModal: true, showCartModal: false }),
  closeReceiptModal: () => set({ showReceiptModal: false }),
  dismissValidation: () => set({ dismissValidationBanner: true }),
  resetValidationDismiss: () => set({ dismissValidationBanner: false }),
}));
