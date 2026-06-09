import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PortalProfileDoc } from "@/types/portal-profile";

export function usePortalProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<PortalProfileDoc | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, "portal_profiles", uid),
      (snap) => {
        setProfile(snap.exists() ? (snap.data() as PortalProfileDoc) : null);
        setIsLoading(false);
      },
      () => {
        setProfile(null);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [uid]);

  return { profile, isLoading };
}
