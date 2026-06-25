import type { ProductSaleChannel } from "@emperatriz/types";
import { isEarlyPayProductChannel, normalizeProductSaleChannel, saleChannelUiLabel } from "@emperatriz/types";

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
];

export function saleChannelOption(channel: ProductSaleChannel): SaleChannelOption {
  const normalized = normalizeProductSaleChannel(channel);
  return (
    PRODUCT_SALE_CHANNEL_OPTIONS.find((option) => option.channel === normalized) ??
    PRODUCT_SALE_CHANNEL_OPTIONS[0]!
  );
}

export function saleChannelLabel(channel: ProductSaleChannel): string {
  return saleChannelUiLabel(normalizeProductSaleChannel(channel));
}

export function earlyPayLineTotal(
  price: number,
  quantity: number,
  discountPercent: number,
): { subtotal: number; discount: number; total: number } {
  const subtotal = price * quantity;
  if (discountPercent <= 0) {
    return { subtotal, discount: 0, total: subtotal };
  }
  const discount = Math.round(subtotal * discountPercent) / 100;
  return { subtotal, discount, total: subtotal - discount };
}

export function productDiscountLineTotal(
  price: number,
  quantity: number,
  productDiscountPercent: number,
): { subtotal: number; discount: number; total: number } {
  return earlyPayLineTotal(price, quantity, productDiscountPercent);
}

export function isChannelEarlyPayEligible(saleChannel: ProductSaleChannel): boolean {
  return isEarlyPayProductChannel(saleChannel);
}
