"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react"
import PostMainLikes from "./PostMainLikes"
import useCreateBucketUrl from "../hooks/useCreateBucketUrl"
import { PostMainCompTypes } from "../types"
import useGetSponsorCampaignByPostId from "../hooks/useGetSponsorCampaignByPostId"
import { isSponsorCampaignActive } from "@/features/sponsor/utils"
import type { SponsorCampaign } from "@/app/types"
import { useUser } from "@/app/context/user"
import useIsFollowing from "@/app/hooks/useIsFollowing"
import useToggleFollow from "@/app/hooks/useToggleFollow"
import { formatShortHash } from "@/lib/utils"
import { FiVolume2, FiVolumeX } from "react-icons/fi"
import { useGeneralStore } from "@/app/stores/general"

export default function PostMain({ post }: PostMainCompTypes) {
    const contextUser = useUser()
    const [sponsorCampaign, setSponsorCampaign] = useState<SponsorCampaign | null>(null)
    const [isFollowing, setIsFollowing] = useState(false)
    const [isFollowLoading, setIsFollowLoading] = useState(false)
    const { isFeedMuted, setIsFeedMuted, toggleFeedMuted } = useGeneralStore()

    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const safePlay = useCallback(() => {
        const video = videoRef.current
        if (!video) return
        const playPromise = video.play()
        if (playPromise) {
            playPromise.catch((error) => {
                if (error?.name !== "AbortError") {
                    console.warn(error)
                }
            })
        }
    }, [])

    useEffect(() => {
        const video = videoRef.current
        const container = containerRef.current
        if (!video || !container) return

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                if (entry?.isIntersecting) {
                    if (video.paused) {
                        safePlay()
                    }
                } else if (!video.paused) {
                    video.pause()
                }
            },
            { threshold: [0.6] },
        )

        observer.observe(container)
        return () => observer.disconnect()
    }, [safePlay])

    useEffect(() => {
        let isMounted = true

        const loadSponsor = async () => {
            if (!post?.id) return
            try {
                const campaign = await useGetSponsorCampaignByPostId(post.id)
                if (isMounted) {
                    setSponsorCampaign(campaign)
                }
            } catch {
                if (isMounted) {
                    setSponsorCampaign(null)
                }
            }
        }

        loadSponsor()

        return () => {
            isMounted = false
        }
    }, [post?.id])

    useEffect(() => {
        let isMounted = true

        const loadFollowState = async () => {
            if (!contextUser?.user?.id || contextUser.user.id === post.profile.user_id) {
                setIsFollowing(false)
                return
            }

            try {
                const result = await useIsFollowing(contextUser.user.id, post.profile.user_id)
                if (!isMounted) return
                setIsFollowing(result)
            } catch {
                if (!isMounted) return
                setIsFollowing(false)
            }
        }

        loadFollowState()

        return () => {
            isMounted = false
        }
    }, [contextUser?.user?.id, post.profile.user_id])

    const handleFollow = async () => {
        if (!contextUser?.user?.id) {
            await contextUser?.openConnect()
            return
        }
        if (contextUser.user.id === post.profile.user_id) return

        try {
            setIsFollowLoading(true)
            const nextState = await useToggleFollow(contextUser.user.id, post.profile.user_id)
            setIsFollowing(nextState)
        } catch (error) {
            console.error(error)
        } finally {
            setIsFollowLoading(false)
        }
    }

    const isSponsored = useMemo(() => {
        return isSponsorCampaignActive(sponsorCampaign)
    }, [sponsorCampaign])

    const togglePlayback = () => {
        const video = videoRef.current
        if (!video) return
        if (isFeedMuted) {
            setIsFeedMuted(false)
        }
        video.paused ? safePlay() : video.pause()
    }

    const toggleMute = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        toggleFeedMuted()
        const video = videoRef.current
        if (video?.paused) {
            safePlay()
        }
    }

    const handleKeyToggle = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            togglePlayback()
        }
    }

    return (
        <>
            <div
                id={`PostMain-${post.id}`}
                ref={containerRef}
                className="feed-item relative flex h-[calc(100vh-60px)] w-full items-center justify-center overflow-hidden border-b border-gray-200 dark:border-white/10"
            >
                <div className="flex w-full max-w-[920px] flex-col items-center gap-6 py-6 md:flex-row md:items-end">
                    <div className="flex w-full flex-1 flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Link href={`/profile/${post.profile.user_id}`}>
                                    <img
                                        className="h-[52px] w-[52px] rounded-full object-cover"
                                        src={useCreateBucketUrl(post?.profile?.image)}
                                        alt={post.profile.name}
                                    />
                                </Link>
                                <div>
                                    <Link href={`/profile/${post.profile.user_id}`}>
                                        <span className="font-bold hover:underline cursor-pointer text-gray-900 dark:text-white">
                                            {post.profile.name}
                                        </span>
                                    </Link>
                                    <div className="text-xs text-gray-500 dark:text-white/60">
                                        @{post.profile.username
                                            ? post.profile.username
                                            : formatShortHash(post.profile.user_id)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {isSponsored ? (
                                    <Link
                                        href={`/sponsor/${post.id}`}
                                        className="rounded-full border border-[color:var(--brand-success)] bg-[color:var(--brand-success-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--brand-success-dark)] dark:text-[color:var(--brand-success)]"
                                    >
                                        Sponsored
                                    </Link>
                                ) : null}
                                {contextUser?.user?.id === post.profile.user_id ? null : (
                                    <button
                                        onClick={() => void handleFollow()}
                                        disabled={isFollowLoading}
                                        aria-pressed={isFollowing}
                                    className={`border text-[15px] px-[21px] py-0.5 font-semibold rounded-md ${
                                        isFollowing
                                            ? "border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
                                            : "border-[color:var(--brand-accent)] text-[color:var(--brand-accent-text)] hover:bg-[color:var(--brand-accent-soft)]"
                                    }`}
                                >
                                        {isFollowing ? "Following" : "Follow"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {post.text?.trim() ? (
                            <p className="line-clamp-2 text-[15px] break-words text-gray-800 dark:text-white/80 md:max-w-[520px]">
                                {post.text}
                            </p>
                        ) : null}

                        <div
                            className="relative mx-auto flex aspect-[9/16] h-[70vh] max-h-[740px] w-full max-w-[420px] items-center overflow-hidden rounded-2xl bg-black"
                            onClick={togglePlayback}
                            onKeyDown={handleKeyToggle}
                            role="button"
                            tabIndex={0}
                            aria-label="Toggle playback"
                        >
                            <video
                                id={`video-${post.id}`}
                                ref={videoRef}
                                loop
                                muted={isFeedMuted}
                                playsInline
                                className="h-full w-full object-cover"
                                src={useCreateBucketUrl(post?.video_url, "")}
                            />
                            <button
                                type="button"
                                onClick={toggleMute}
                                className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition hover:bg-black/80"
                                aria-label={isFeedMuted ? "Unmute video" : "Mute video"}
                            >
                                {isFeedMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                            </button>
                            <img
                                className="absolute right-2 bottom-10 w-[84px]"
                                src="/images/clip-yield-logo.png"
                                alt="ClipYield"
                            />
                        </div>
                    </div>

                    <PostMainLikes post={post} />
                </div>
            </div>
        </>
    )
}
