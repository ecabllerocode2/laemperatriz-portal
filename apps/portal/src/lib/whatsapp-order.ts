export const CATALOG_WHATSAPP_PHONE = "5534323721";
export const CUSTOMER_SERVICE_WHATSAPP_PHONE = "5537119349";

export function catalogWhatsAppUrl(
  message?: string,
  phone: string = CATALOG_WHATSAPP_PHONE,
): string {
  const base = `https://wa.me/52${phone}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function customerServiceWhatsAppUrl(message?: string): string {
  return catalogWhatsAppUrl(message, CUSTOMER_SERVICE_WHATSAPP_PHONE);
}

export function catalogProductWhatsAppMessage(input: {
  productName: string;
  sku: string;
  variantLabel?: string | null;
}): string {
  const name = input.productName.trim();
  const sku = input.sku.trim();
  const variant = input.variantLabel?.trim();

  if (variant) {
    return `Hola, quiero pedir: ${name} — ${variant} (SKU ${sku})`;
  }

  return `Hola, quiero pedir: ${name} (SKU ${sku})`;
}
