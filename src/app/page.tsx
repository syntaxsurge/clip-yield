"use client"

import { useEffect } from "react"
import MainLayout from "./layouts/MainLayout"
import { usePostStore } from "@/app/stores/post"
import ClientOnly from "./components/ClientOnly"
import PostMain from "./components/PostMain"
import EmptyState from "@/components/feedback/EmptyState"
import FeedNavButtons from "@/components/layout/FeedNavButtons"
import { useScrollSnapNavigation } from "@/hooks/useScrollSnapNavigation"

export default function Home() {
  let { allPosts, setAllPosts } = usePostStore();
  const {
    containerRef,
    activeIndex,
    hasNext,
    hasPrev,
    scrollToIndex,
  } = useScrollSnapNavigation({ itemCount: allPosts.length });
  useEffect(() => { setAllPosts() }, [setAllPosts])
  return (
    <>
      <MainLayout>
        <div className="mx-auto mt-[60px] h-[calc(100vh-60px)] w-full max-w-[920px] px-4">
          <ClientOnly>
            {allPosts.length === 0 ? (
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
                {allPosts.map((post, index) => (
                  <PostMain post={post} key={index} />
                ))}
                </div>
                {allPosts.length > 1 ? (
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
