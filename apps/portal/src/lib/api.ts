import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth.store";

const API_URL = import.meta.env["VITE_API_URL"] || "";

async function resolveAuthToken(forceRefresh = false): Promise<string | undefined> {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    return firebaseUser.getIdToken(forceRefresh);
  }
  return useAuthStore.getState().token ?? undefined;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retryOnInvalidToken = true,
): Promise<T> {
  const token = await resolveAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = (await res.json()) as {
    success: boolean;
    data?: T;
    error?: { code: string; message: string };
  };

  if (
    retryOnInvalidToken &&
    res.status === 401 &&
    json.error?.code === "INVALID_TOKEN" &&
    auth.currentUser
  ) {
    const freshToken = await resolveAuthToken(true);
    if (freshToken && freshToken !== token) {
      return apiRequest<T>(path, options, false);
    }
  }

  if (!res.ok || !json.success) {
    const msg = json.error?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json.data as T;
}
