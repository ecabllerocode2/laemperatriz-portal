import { create } from "zustand";
import {
  DEFAULT_RECEIPT_MODAL_OPTIONS,
  type ReceiptModalOptions,
} from "@/components/cart/receipt-modal-config";

interface UiState {
  toast: string | null;
  showCartModal: boolean;
  showReceiptModal: boolean;
  showShippingAddressModal: boolean;
  receiptModalOptions: ReceiptModalOptions;
  dismissValidationBanner: boolean;
  /** Evita reabrir el modal de carrito tras enviar comprobante (mientras el perfil sigue en "none"). */
  depositReceiptSubmitted: boolean;
  profileReloadTick: number;
  setToast: (message: string | null) => void;
  bumpProfileReload: () => void;
  openCartModal: () => void;
  closeCartModal: () => void;
  openReceiptModal: (options?: Partial<ReceiptModalOptions>) => void;
  closeReceiptModal: () => void;
  backFromReceiptModal: () => void;
  openShippingAddressModal: () => void;
  closeShippingAddressModal: () => void;
  markDepositReceiptSubmitted: () => void;
  clearDepositReceiptSubmitted: () => void;
  dismissValidation: () => void;
  resetValidationDismiss: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  toast: null,
  showCartModal: false,
  showReceiptModal: false,
  showShippingAddressModal: false,
  receiptModalOptions: DEFAULT_RECEIPT_MODAL_OPTIONS,
  dismissValidationBanner: false,
  depositReceiptSubmitted: false,

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
  openShippingAddressModal: () => set({ showShippingAddressModal: true }),
  closeShippingAddressModal: () => set({ showShippingAddressModal: false }),
  markDepositReceiptSubmitted: () => set({ depositReceiptSubmitted: true, showCartModal: false }),
  clearDepositReceiptSubmitted: () => set({ depositReceiptSubmitted: false }),
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
