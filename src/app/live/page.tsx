"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/app/layouts/MainLayout";
import useGetAllPosts from "@/app/hooks/useGetAllPosts";
import type { PostWithProfile } from "@/app/types";
import ClientOnly from "@/app/components/ClientOnly";
import PostUser from "@/app/components/profile/PostUser";
import EmptyState from "@/components/feedback/EmptyState";

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
      <div className="mx-auto mt-[80px] w-full max-w-[980px] px-3 pb-16">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            LIVE
          </h1>
          <p className="text-sm text-gray-500 dark:text-white/60">
            Catch up on creator replays and trending clips.
          </p>
        </div>

        <ClientOnly>
          {status === "loading" ? (
            <EmptyState
              title="Loading live replays…"
              description="Hang tight while we fetch the latest clips."
            />
          ) : status === "error" ? (
            <EmptyState
              title="Unable to load live replays"
              description="Please try again in a moment."
            />
          ) : posts.length === 0 ? (
            <EmptyState
              title="No live replays yet"
              description="Upload a clip or explore the feed to spark the next live session."
              primaryAction={{ label: "Upload a clip", href: "/upload" }}
              secondaryAction={{ label: "Back to For You", href: "/" }}
            />
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
