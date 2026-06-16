import type { ProductSaleChannel } from "@emperatriz/types";

export interface SaleChannelOption {
  channel: ProductSaleChannel;
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const PRODUCT_SALE_CHANNEL_OPTIONS: SaleChannelOption[] = [
  {
    channel: "facebook",
    label: "Azul",
    badgeClass: "bg-blue-500/10 text-blue-600",
    dotClass: "bg-blue-500",
  },
  {
    channel: "no_discount",
    label: "Naranja",
    badgeClass: "bg-orange-500/10 text-orange-600",
    dotClass: "bg-orange-500",
  },
  {
    channel: "whatsapp",
    label: "Verde",
    badgeClass: "bg-emerald-500/10 text-emerald-600",
    dotClass: "bg-emerald-500",
  },
];

export function saleChannelOption(channel: ProductSaleChannel): SaleChannelOption {
  return (
    PRODUCT_SALE_CHANNEL_OPTIONS.find((option) => option.channel === channel) ??
    PRODUCT_SALE_CHANNEL_OPTIONS[0]!
  );
}

export function earlyPayLineTotal(
  price: number,
  quantity: number,
  earlyPayDiscountPercent: number,
): { subtotal: number; discount: number; total: number } {
  const subtotal = price * quantity;
  if (earlyPayDiscountPercent <= 0) {
    return { subtotal, discount: 0, total: subtotal };
  }
  const discount = Math.round(subtotal * earlyPayDiscountPercent) / 100;
  return { subtotal, discount, total: subtotal - discount };
}
