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
        <div className="mx-auto mt-[80px] w-full max-w-[690px] px-3 pb-16">
          <ClientOnly>
            {allPosts.length === 0 ? (
              <EmptyState
                title="No clips yet"
                description="Upload your first video or explore creator boosts to get started."
                primaryAction={{ label: "Upload a clip", href: "/upload" }}
                secondaryAction={{
                  label: "View leaderboard",
                  href: "/leaderboard",
                }}
              />
            ) : (
              allPosts.map((post, index) => (
                <PostMain post={post} key={index} />
              ))
            )}
          </ClientOnly>
        </div>
      </MainLayout>
    </>
  )
}
