import { useCallback, useEffect, useRef, useState } from "react";

type ScrollSnapConfig = {
  itemCount: number;
  lockDurationMs?: number;
};

export function useScrollSnapNavigation({
  itemCount,
  lockDurationMs = 620,
}: ScrollSnapConfig) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollLockRef = useRef(false);

  const clampIndex = useCallback(
    (index: number) => Math.max(0, Math.min(index, Math.max(itemCount - 1, 0))),
    [itemCount],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container) return;
      const nextIndex = clampIndex(index);
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.clientHeight * nextIndex,
          behavior: "smooth",
        });
      });
      setActiveIndex(nextIndex);
    },
    [clampIndex],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (itemCount === 0) {
      setActiveIndex(0);
      container.scrollTo({ top: 0 });
      return;
    }

    if (activeIndex >= itemCount) {
      const clampedIndex = clampIndex(activeIndex);
      setActiveIndex(clampedIndex);
      container.scrollTo({ top: container.clientHeight * clampedIndex });
    }
  }, [activeIndex, clampIndex, itemCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      if (itemCount <= 1) return;
      event.preventDefault();
      if (scrollLockRef.current) return;

      scrollLockRef.current = true;
      const direction = event.deltaY > 0 ? 1 : -1;
      scrollToIndex(activeIndex + direction);

      window.setTimeout(() => {
        scrollLockRef.current = false;
      }, lockDurationMs);
    };

    const handleScroll = () => {
      if (!container) return;
      const nextIndex = Math.round(container.scrollTop / container.clientHeight);
      setActiveIndex(clampIndex(nextIndex));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [activeIndex, clampIndex, itemCount, lockDurationMs, scrollToIndex]);

  return {
    containerRef,
    activeIndex,
    hasPrev: activeIndex > 0,
    hasNext: activeIndex < Math.max(itemCount - 1, 0),
    scrollToIndex,
  };
}
