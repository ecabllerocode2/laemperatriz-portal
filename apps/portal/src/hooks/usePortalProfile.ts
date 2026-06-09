import { useCallback, useEffect, useState } from "react";
import { fetchPortalProfile } from "@/lib/portal-profile";
import { useUiStore } from "@/stores/ui.store";
import type { PortalProfileDoc } from "@/types/portal-profile";

export function usePortalProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<PortalProfileDoc | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(uid));
  const profileReloadTick = useUiStore((s) => s.profileReloadTick);

  const reload = useCallback(async () => {
    if (!uid) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchPortalProfile();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    setIsLoading(Boolean(uid));
    void reload();
  }, [uid, reload, profileReloadTick]);

  useEffect(() => {
    if (!uid || profile?.depositStatus !== "pending") return;

    const interval = window.setInterval(() => {
      void reload();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [uid, profile?.depositStatus, reload]);

  return { profile, isLoading, reload };
}
