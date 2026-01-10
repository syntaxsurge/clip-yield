"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import MainLayout from "./layouts/MainLayout"
import ClientOnly from "./components/ClientOnly"
import PostMain from "./components/PostMain"
import EmptyState from "@/components/feedback/EmptyState"
import FeedNavButtons from "@/components/layout/FeedNavButtons"
import { useScrollSnapNavigation } from "@/hooks/useScrollSnapNavigation"
import useGetAllPostsPage from "@/app/hooks/useGetAllPostsPage"
import type { PostWithProfile } from "@/app/types"

export default function Home() {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const loadPage = useCallback(async () => {
    if (isFetchingMore || isDone) return;
    setIsFetchingMore(true);
    try {
      const result = await useGetAllPostsPage({ cursor, limit: 6 });
      setPosts((prev) => [...prev, ...result.page]);
      setCursor(result.continueCursor ?? null);
      setIsDone(result.isDone);
      setStatus("ready");
    } catch {
      setStatus("error");
    } finally {
      setIsFetchingMore(false);
    }
  }, [cursor, isDone, isFetchingMore]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const itemCount = posts.length;
  const {
    containerRef,
    activeIndex,
    hasNext,
    hasPrev,
    scrollToIndex,
  } = useScrollSnapNavigation({ itemCount });

  useEffect(() => {
    if (!isDone && activeIndex >= Math.max(itemCount - 2, 0)) {
      void loadPage();
    }
  }, [activeIndex, itemCount, isDone, loadPage]);

  const showEmpty = useMemo(
    () => status === "ready" && posts.length === 0,
    [posts.length, status],
  );

  return (
    <>
      <MainLayout>
        <div className="mx-auto mt-[60px] h-[calc(100vh-60px)] w-full max-w-[920px] px-4">
          <ClientOnly>
            {status === "loading" && posts.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  title="Loading clips…"
                  description="Hang tight while we pull in the latest feed."
                />
              </div>
            ) : status === "error" ? (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  title="We couldn’t load clips"
                  description="Please try again in a moment."
                />
              </div>
            ) : showEmpty ? (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  title="No clips yet"
                  description="Upload your first video or explore creator boosts to get started."
                  primaryAction={{ label: "Upload a clip", href: "/upload" }}
                  secondaryAction={{
                    label: "View leaderboard",
                    href: "/leaderboard",
                  }}
                />
              </div>
            ) : (
              <div className="relative h-full">
                <div
                  ref={containerRef}
                  className="feed-scroll h-full overscroll-contain overflow-y-auto snap-y snap-mandatory"
                >
                {posts.map((post, index) => (
                  <PostMain post={post} key={index} />
                ))}
                </div>
                {posts.length > 1 ? (
                  <FeedNavButtons
                    onPrev={() => scrollToIndex(activeIndex - 1)}
                    onNext={() => scrollToIndex(activeIndex + 1)}
                    disablePrev={!hasPrev}
                    disableNext={!hasNext}
                    className="fixed right-6 top-1/2 z-30 -translate-y-1/2"
                  />
                ) : null}
              </div>
            )}
          </ClientOnly>
        </div>
      </MainLayout>
    </>
  )
}
