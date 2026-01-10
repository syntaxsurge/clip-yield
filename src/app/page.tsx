"use client"

import { useEffect } from "react"
import MainLayout from "./layouts/MainLayout"
import { usePostStore } from "@/app/stores/post"
import ClientOnly from "./components/ClientOnly"
import PostMain from "./components/PostMain"
import EmptyState from "@/components/feedback/EmptyState"

export default function Home() {
  let { allPosts, setAllPosts } = usePostStore();
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
              <div className="h-full overflow-y-auto snap-y snap-mandatory">
                {allPosts.map((post, index) => (
                  <PostMain post={post} key={index} />
                ))}
              </div>
            )}
          </ClientOnly>
        </div>
      </MainLayout>
    </>
  )
}
