import type { PortalNotification } from "@emperatriz/types";
import { apiRequest } from "@/lib/api";

export async function fetchPortalNotifications(): Promise<{
  notifications: PortalNotification[];
  unreadCount: number;
}> {
  return apiRequest<{ notifications: PortalNotification[]; unreadCount: number }>(
    "/api/portal/notifications",
  );
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiRequest(`/api/portal/notifications/${id}/read`, {
    method: "POST",
    body: "{}",
  });
}
