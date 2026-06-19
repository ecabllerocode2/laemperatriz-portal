/** Dígitos nacionales (10) de un teléfono mexicano. */
export function mexicanPhoneNationalDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return digits;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }

  if (digits.length === 12 && digits.startsWith("52")) {
    return digits.slice(2);
  }

  if (digits.length === 13 && digits.startsWith("521")) {
    return digits.slice(3);
  }

  if (digits.length > 10) {
    return digits.slice(-10);
  }

  return null;
}

/** Formato canónico E.164 para México: +52 + 10 dígitos nacionales. */
export function normalizeMexicanPhone(phone: string): string {
  const national = mexicanPhoneNationalDigits(phone);
  if (!national) {
    const fallback = phone.replace(/\D/g, "");
    return fallback ? `+${fallback}` : phone.trim();
  }
  return `+52${national}`;
}

export function isValidMexicanPhone(phone: string): boolean {
  const normalized = normalizeMexicanPhone(phone);
  return /^\+52\d{10}$/.test(normalized);
}

export function phonesMatch(a: string, b: string): boolean {
  return normalizeMexicanPhone(a) === normalizeMexicanPhone(b);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}
