import { useEffect, useRef } from "react";

export function useInfiniteScroll(
  enabled: boolean,
  onLoadMore: () => void,
  options?: { rootMargin?: string },
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) onLoadMore();
      },
      { rootMargin: options?.rootMargin ?? "240px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, onLoadMore, options?.rootMargin]);

  return sentinelRef;
}
