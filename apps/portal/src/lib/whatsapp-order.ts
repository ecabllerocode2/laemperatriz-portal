export const CATALOG_WHATSAPP_PHONE = "5534323721";

export function catalogWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/52${CATALOG_WHATSAPP_PHONE}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
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
