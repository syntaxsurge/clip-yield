"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainLayout from "@/app/layouts/MainLayout";
import useGetAllPosts from "@/app/hooks/useGetAllPosts";
import type { PostWithProfile } from "@/app/types";
import ClientOnly from "@/app/components/ClientOnly";
import PostUser from "@/app/components/profile/PostUser";

export default function LivePage() {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      try {
        const result = await useGetAllPosts();
        if (!isMounted) return;
        setPosts(result);
        setStatus("ready");
      } catch {
        if (!isMounted) return;
        setPosts([]);
        setStatus("error");
      }
    };

    loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <MainLayout>
      <div className="mt-[80px] w-[calc(100%-90px)] max-w-[980px] ml-auto pr-3">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">LIVE</h1>
          <p className="text-sm text-gray-500">
            Catch up on creator replays and trending clips.
          </p>
        </div>

        <ClientOnly>
          {status === "loading" ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Loading live replays...
            </div>
          ) : status === "error" ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Unable to load live replays. Please try again.
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              <p className="font-semibold text-gray-700">No live replays yet</p>
              <p className="mt-2">
                Upload a clip or explore the feed to spark the next live session.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href="/upload"
                  className="rounded-md bg-[#F02C56] px-4 py-2 text-sm font-semibold text-white"
                >
                  Upload a clip
                </Link>
                <Link
                  href="/"
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Back to For You
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
              {posts.slice(0, 12).map((post, index) => (
                <div key={index} className="relative">
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                    Replay
                  </span>
                  <PostUser post={post} />
                </div>
              ))}
            </div>
          )}
        </ClientOnly>
      </div>
    </MainLayout>
  );
}
