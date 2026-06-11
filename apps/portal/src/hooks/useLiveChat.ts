import { useCallback, useEffect, useState } from "react";
import { limitToLast, onValue, orderByChild, push, query, ref } from "firebase/database";
import type { LiveChatComment } from "@emperatriz/types";
import { rtdb } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth.store";

const MAX_VISIBLE = 30;

function mapComments(data: Record<string, unknown> | null): LiveChatComment[] {
  if (!data) return [];

  return Object.entries(data)
    .map(([id, raw]) => {
      const row = raw as Record<string, unknown>;
      const createdAt = row["createdAt"];
      return {
        id,
        authorId: String(row["authorId"] ?? ""),
        authorName: String(row["authorName"] ?? "Clienta"),
        text: String(row["text"] ?? ""),
        createdAt:
          typeof createdAt === "number"
            ? createdAt
            : typeof createdAt === "object" && createdAt !== null && "toMillis" in createdAt
              ? Number((createdAt as { toMillis?: () => number }).toMillis?.() ?? Date.now())
              : Date.now(),
      };
    })
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-MAX_VISIBLE);
}

export function useLiveChat(sessionId: string | null | undefined, authorName: string) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<LiveChatComment[]>([]);
  const [chatActive, setChatActive] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setComments([]);
      setChatActive(false);
      return;
    }

    const metaRef = ref(rtdb, `liveChats/${sessionId}/meta`);
    const commentsRef = query(
      ref(rtdb, `liveChats/${sessionId}/comments`),
      orderByChild("createdAt"),
      limitToLast(MAX_VISIBLE),
    );

    const unsubMeta = onValue(
      metaRef,
      (snap) => {
        setChatActive(Boolean(snap.val()?.active));
      },
      () => setChatActive(false),
    );

    const unsubComments = onValue(
      commentsRef,
      (snap) => {
        setComments(mapComments(snap.val() as Record<string, unknown> | null));
        setError(null);
      },
      () => {
        setComments([]);
        setError("No se pudo cargar el chat.");
      },
    );

    return () => {
      unsubMeta();
      unsubComments();
    };
  }, [sessionId]);

  const sendComment = useCallback(
    async (text: string) => {
      if (!sessionId || !user || !chatActive) return false;

      const trimmed = text.trim().slice(0, 280);
      if (!trimmed) return false;

      setSending(true);
      setError(null);
      try {
        await push(ref(rtdb, `liveChats/${sessionId}/comments`), {
          authorId: user.uid,
          authorName: authorName.trim().slice(0, 80) || "Clienta",
          text: trimmed,
          createdAt: Date.now(),
        });
        return true;
      } catch {
        setError("No se pudo enviar el comentario.");
        return false;
      } finally {
        setSending(false);
      }
    },
    [sessionId, user, chatActive, authorName],
  );

  return { comments, chatActive, sending, error, sendComment };
}
