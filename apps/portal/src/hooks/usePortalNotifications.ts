import { useCallback, useEffect, useState } from "react";
import type { PortalNotification } from "@emperatriz/types";
import { fetchPortalNotifications, markNotificationRead } from "@/lib/notifications";

export function usePortalNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(enabled);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await fetchPortalNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
    if (!enabled) return;
    const id = window.setInterval(() => void reload(), 120_000);
    return () => window.clearInterval(id);
  }, [reload, enabled]);

  const markRead = useCallback(
    async (id: string) => {
      await markNotificationRead(id);
      await reload();
    },
    [reload],
  );

  return { notifications, unreadCount, loading, reload, markRead };
}
