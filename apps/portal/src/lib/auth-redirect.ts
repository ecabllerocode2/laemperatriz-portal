/** Rutas internas seguras para redirección post-login. */
export function resolveReturnTo(searchParams: URLSearchParams): string {
  const raw = searchParams.get("returnTo");
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export function loginPathWithReturn(returnTo: string): string {
  return `/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function registerPathWithReturn(returnTo: string): string {
  return `/register?returnTo=${encodeURIComponent(returnTo)}`;
}

export function completarRegistroPathWithReturn(returnTo: string): string {
  return `/completar-registro?returnTo=${encodeURIComponent(returnTo)}`;
}
