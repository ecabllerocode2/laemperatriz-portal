import { useState } from "react";
import { Bell, X } from "lucide-react";
import { usePortalNotifications } from "@/hooks/usePortalNotifications";

export default function NotificationsBell({ enabled = true }: { enabled?: boolean }) {
  const { notifications, unreadCount, markRead } = usePortalNotifications(enabled);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-brand-night hover:bg-neutral-50 sm:h-10 sm:w-10"
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/20"
            aria-label="Cerrar notificaciones"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white shadow-xl sm:w-80">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <p className="text-sm font-bold text-brand-night">Notificaciones</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-neutral-500">
                  Sin notificaciones
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => void markRead(n.id)}
                    className={`mb-1 w-full rounded-xl px-3 py-2.5 text-left text-sm ${
                      n.read ? "bg-white text-neutral-600" : "bg-red-50 text-brand-night"
                    }`}
                  >
                    <p className="font-semibold">{n.title}</p>
                    <p className="mt-0.5 text-xs opacity-90">{n.body}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
