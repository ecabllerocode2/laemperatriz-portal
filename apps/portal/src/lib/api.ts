import { useAuthStore } from "@/stores/auth.store";
import { getAuth } from "firebase/auth";

const API_URL = import.meta.env["VITE_API_URL"] || "";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token = useAuthStore.getState().token;
  if (!token) {
    const firebaseUser = getAuth().currentUser;
    if (firebaseUser) {
      token = await firebaseUser.getIdToken();
    }
  }

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

  if (!res.ok || !json.success) {
    const msg = json.error?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json.data as T;
}
