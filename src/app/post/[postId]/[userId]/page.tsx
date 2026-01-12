"use client"

import Comments from "@/app/components/post/Comments"
import CommentsHeader from "@/app/components/post/CommentsHeader"
import Link from "next/link"
import { use, useCallback, useEffect, useMemo, useRef } from "react"
import { AiOutlineClose } from "react-icons/ai"
import { useRouter } from "nextjs-toploader/app"
import ClientOnly from "@/app/components/ClientOnly"
import { PostPageTypes } from "@/app/types"
import { usePostStore } from "@/app/stores/post"
import { useLikeStore } from "@/app/stores/like"
import { useCommentStore } from "@/app/stores/comment"
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl"
import FeedNavButtons from "@/components/layout/FeedNavButtons"
import { ClipVideoPlayer } from "@/components/data-display/ClipVideoPlayer"

export default function Post({ params }: PostPageTypes) {
    const { postId, userId } = use(params)

    let { postById, postsByUser, setPostById, setPostsByUser } = usePostStore()
    let { setLikesByPost } = useLikeStore()
    let { setCommentsByPost } = useCommentStore()

    const router = useRouter()
    const videoPanelRef = useRef<HTMLDivElement>(null)
    const scrollLockRef = useRef(false)

    useEffect(() => { 
        setPostById(postId)
        setCommentsByPost(postId) 
        setLikesByPost(postId)
        setPostsByUser(userId) 
    }, [postId, setCommentsByPost, setLikesByPost, setPostById, setPostsByUser, userId])

    const currentIndex = useMemo(
        () => postsByUser.findIndex((post) => post.id === postId),
        [postId, postsByUser],
    )

    const navigateToIndex = useCallback(
        (nextIndex: number) => {
            if (nextIndex < 0 || nextIndex >= postsByUser.length) return
            const nextPost = postsByUser[nextIndex]
            if (!nextPost) return
            const url = `/post/${nextPost.id}/${userId}`
            if (typeof document !== "undefined") {
                const doc = document as Document & {
                    startViewTransition?: (callback: () => void) => void
                }
                if (doc.startViewTransition) {
                    doc.startViewTransition(() => router.push(url))
                    return
                }
            }
            router.push(url)
        },
        [postsByUser, router, userId],
    )

    const goPrev = useCallback(() => {
        navigateToIndex(currentIndex - 1)
    }, [currentIndex, navigateToIndex])

    const goNext = useCallback(() => {
        navigateToIndex(currentIndex + 1)
    }, [currentIndex, navigateToIndex])

    useEffect(() => {
        const panel = videoPanelRef.current
        if (!panel) return

        const handleWheel = (event: WheelEvent) => {
            if (postsByUser.length <= 1) return
            event.preventDefault()
            if (scrollLockRef.current) return

            scrollLockRef.current = true
            const direction = event.deltaY > 0 ? 1 : -1
            direction > 0 ? goNext() : goPrev()

            window.setTimeout(() => {
                scrollLockRef.current = false
            }, 620)
        }

        panel.addEventListener("wheel", handleWheel, { passive: false })

        return () => {
            panel.removeEventListener("wheel", handleWheel)
        }
    }, [goNext, goPrev, postsByUser.length])

    return (
        <>
            <div 
                id="PostPage" 
                className="lg:flex justify-between w-full h-screen overflow-hidden bg-black"
            >
                <div ref={videoPanelRef} className="lg:w-[calc(100%-540px)] h-full relative">
                    <Link
                        href={`/profile/${userId}`}
                        className="absolute z-20 m-5 rounded-full bg-gray-700 p-1.5 text-white hover:bg-gray-800"
                    >
                        <AiOutlineClose size="27"/>
                    </Link>
                    {postsByUser.length > 1 ? (
                        <FeedNavButtons
                            onPrev={goPrev}
                            onNext={goNext}
                            disablePrev={currentIndex <= 0}
                            disableNext={currentIndex >= postsByUser.length - 1}
                            className="absolute right-4 top-1/2 z-20 -translate-y-1/2"
                        />
                    ) : null}

                    <img 
                        className="absolute z-20 top-[18px] left-[70px] h-10 w-auto lg:mx-0 mx-auto" 
                        src="/images/clip-yield-logo.png"
                        alt="ClipYield"
                    />

                    <ClientOnly>
                        <div className="relative z-10 flex h-screen items-center justify-center bg-black/70 lg:min-w-[480px]">
                            {postById?.video_url ? (
                                <div className="relative w-full max-w-[440px]">
                                    <ClipVideoPlayer
                                        src={useCreateBucketUrl(postById.video_url, "")}
                                        autoPlay
                                        loop
                                        showLogo={false}
                                        showMeta={false}
                                        className="h-[86vh] max-h-[760px] w-full"
                                    />
                                </div>
                            ) : null}
                        </div>
                    </ClientOnly>

                </div>

                <div
                    id="InfoSection"
                    className="relative w-full h-full border-l border-gray-200 bg-white text-gray-900 lg:max-w-[550px] dark:border-white/10 dark:bg-[#0f0f12] dark:text-white"
                >
                    <div className="py-7" />

                        <ClientOnly>
                            {postById ? (
                                <CommentsHeader post={postById} params={{ postId, userId }} />
                            ) : null}
                        </ClientOnly>
                        <Comments params={{ postId, userId }} />

                </div>
            </div>
        </>
    )
}
