"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/app/layouts/MainLayout";
import { useUser } from "@/app/context/user";
import useGetFollowingPosts from "@/app/hooks/useGetFollowingPosts";
import type { PostWithProfile } from "@/app/types";
import ClientOnly from "@/app/components/ClientOnly";
import PostMain from "@/app/components/PostMain";
import EmptyState from "@/components/feedback/EmptyState";

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
      <div className="mx-auto mt-[60px] h-[calc(100vh-60px)] w-full max-w-[920px] px-4">
        <ClientOnly>
          {!contextUser?.user?.id ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                title="Follow creators"
                description="Connect your wallet to see clips from creators you follow."
                primaryAction={{
                  label: "Connect wallet",
                  onClick: () => void contextUser?.openConnect(),
                }}
              />
            </div>
          ) : status === "loading" ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                title="Loading followed clips…"
                description="Hang tight while we pull in your creators."
              />
            </div>
          ) : status === "error" ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                title="Couldn’t load followed clips"
                description="Please try again in a moment."
              />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                title="No followed clips yet"
                description="Follow a creator from the For You feed to start curating your list."
                secondaryAction={{ label: "Explore For You", href: "/" }}
              />
            </div>
          ) : (
            <div className="h-full overflow-y-auto snap-y snap-mandatory">
              {posts.map((post, index) => (
                <PostMain post={post} key={index} />
              ))}
            </div>
          )}
        </ClientOnly>
      </div>
    </MainLayout>
  );
}
