import { useRef, useEffect, useCallback } from "react";

interface UseInfiniteScrollOptions {
  /** Whether infinite scroll is enabled */
  enabled: boolean;
  /** Threshold for intersection observer (0-1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
}

interface UseInfiniteScrollReturn {
  /** Ref to attach to the sentinel element */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook for handling infinite scroll using IntersectionObserver
 * @param callback - Function to call when sentinel is visible
 * @param options - Configuration options
 * @returns Object with sentinelRef to attach to sentinel element
 */
export function useInfiniteScroll(
  callback: () => void,
  options: UseInfiniteScrollOptions,
): UseInfiniteScrollReturn {
  const { enabled, threshold = 0.1, rootMargin = "100px" } = options;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && enabled) {
        callbackRef.current();
      }
    },
    [enabled],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [enabled, threshold, rootMargin, handleIntersection]);

  return { sentinelRef };
}
