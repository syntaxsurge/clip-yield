"use client"

import { useEffect } from "react"
import MainLayout from "./layouts/MainLayout"
import { usePostStore } from "@/app/stores/post"
import ClientOnly from "./components/ClientOnly"
import PostMain from "./components/PostMain"
import Link from "next/link"

export default function Home() {
  let { allPosts, setAllPosts } = usePostStore();
  useEffect(() => { setAllPosts() }, [setAllPosts])
  return (
    <>
      <MainLayout>
        <div className="mt-[80px]  w-[calc(100%-90px)] max-w-[690px] ml-auto">
          <ClientOnly>
            {allPosts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                <p className="font-semibold text-gray-700">No clips yet</p>
                <p className="mt-2">
                  Upload your first video or explore creator boosts to get started.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/upload"
                    className="rounded-md bg-[#F02C56] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Upload a clip
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    View leaderboard
                  </Link>
                </div>
              </div>
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
