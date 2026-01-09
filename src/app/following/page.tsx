"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainLayout from "@/app/layouts/MainLayout";
import { useUser } from "@/app/context/user";
import useGetFollowingPosts from "@/app/hooks/useGetFollowingPosts";
import type { PostWithProfile } from "@/app/types";
import ClientOnly from "@/app/components/ClientOnly";
import PostMain from "@/app/components/PostMain";

export default function FollowingPage() {
  const contextUser = useUser();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");

  useEffect(() => {
    if (!contextUser?.user?.id) {
      setStatus("idle");
      setPosts([]);
      return;
    }

    let isMounted = true;
    setStatus("loading");

    const loadFollowing = async () => {
      try {
        const results = await useGetFollowingPosts(contextUser.user.id);
        if (!isMounted) return;
        setPosts(results);
        setStatus("idle");
      } catch {
        if (!isMounted) return;
        setPosts([]);
        setStatus("error");
      }
    };

    loadFollowing();

    return () => {
      isMounted = false;
    };
  }, [contextUser?.user?.id]);

  return (
    <MainLayout>
      <div className="mt-[80px] w-[calc(100%-90px)] max-w-[690px] ml-auto">
        <ClientOnly>
          {!contextUser?.user?.id ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              <p className="font-semibold text-gray-700">Follow creators</p>
              <p className="mt-2">
                Connect your wallet to see clips from creators you follow.
              </p>
              <button
                onClick={() => void contextUser?.openConnect()}
                className="mt-4 rounded-md bg-[#F02C56] px-4 py-2 text-sm font-semibold text-white"
              >
                Connect wallet
              </button>
            </div>
          ) : status === "loading" ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Loading your followed clips...
            </div>
          ) : status === "error" ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Something went wrong while loading followed clips. Please try
              again.
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              <p className="font-semibold text-gray-700">No followed clips yet</p>
              <p className="mt-2">
                Follow a creator from the For You feed to start curating your
                following list.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Explore For You
              </Link>
            </div>
          ) : (
            posts.map((post, index) => <PostMain post={post} key={index} />)
          )}
        </ClientOnly>
      </div>
    </MainLayout>
  );
}
