import { create } from "zustand";
import {
  DEFAULT_RECEIPT_MODAL_OPTIONS,
  type ReceiptModalOptions,
} from "@/components/cart/receipt-modal-config";

interface UiState {
  toast: string | null;
  showCartModal: boolean;
  showReceiptModal: boolean;
  receiptModalOptions: ReceiptModalOptions;
  dismissValidationBanner: boolean;
  profileReloadTick: number;
  setToast: (message: string | null) => void;
  bumpProfileReload: () => void;
  openCartModal: () => void;
  closeCartModal: () => void;
  openReceiptModal: (options?: Partial<ReceiptModalOptions>) => void;
  closeReceiptModal: () => void;
  backFromReceiptModal: () => void;
  dismissValidation: () => void;
  resetValidationDismiss: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  toast: null,
  showCartModal: false,
  showReceiptModal: false,
  receiptModalOptions: DEFAULT_RECEIPT_MODAL_OPTIONS,
  dismissValidationBanner: false,

  profileReloadTick: 0,

  setToast: (toast) => set({ toast }),
  bumpProfileReload: () =>
    set((state) => ({ profileReloadTick: state.profileReloadTick + 1 })),
  openCartModal: () => set({ showCartModal: true }),
  closeCartModal: () => set({ showCartModal: false }),
  openReceiptModal: (options) =>
    set({
      showReceiptModal: true,
      showCartModal: false,
      receiptModalOptions: {
        ...DEFAULT_RECEIPT_MODAL_OPTIONS,
        ...options,
      },
    }),
  closeReceiptModal: () => set({ showReceiptModal: false }),
  backFromReceiptModal: () => {
    const purpose = get().receiptModalOptions.purpose;
    if (purpose === "cart") {
      set({ showReceiptModal: false, showCartModal: true });
    } else {
      set({ showReceiptModal: false });
    }
  },
  dismissValidation: () => set({ dismissValidationBanner: true }),
  resetValidationDismiss: () => set({ dismissValidationBanner: false }),
}));
