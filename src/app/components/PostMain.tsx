"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
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
import { useGeneralStore } from "@/app/stores/general"
import { ClipVideoPlayer } from "@/components/data-display/ClipVideoPlayer"

type PostMainProps = PostMainCompTypes & {
    onAutoAdvance?: () => void
}

export default function PostMain({ post, onAutoAdvance }: PostMainProps) {
    const contextUser = useUser()
    const [sponsorCampaign, setSponsorCampaign] = useState<SponsorCampaign | null>(null)
    const [isFollowing, setIsFollowing] = useState(false)
    const [isFollowLoading, setIsFollowLoading] = useState(false)
    const { isAutoScrollEnabled } = useGeneralStore()

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

    const handleAutoAdvance = useCallback(() => {
        if (!isAutoScrollEnabled) return
        if (onAutoAdvance) onAutoAdvance()
    }, [isAutoScrollEnabled, onAutoAdvance])

    return (
        <>
            <div
                id={`PostMain-${post.id}`}
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

                        <ClipVideoPlayer
                            src={useCreateBucketUrl(post?.video_url, "")}
                            observeVisibility
                            loop={!isAutoScrollEnabled}
                            onEnded={handleAutoAdvance}
                            className="mx-auto aspect-[9/16] h-[70vh] max-h-[740px] w-full max-w-[420px]"
                        />
                    </div>

                    <PostMainLikes post={post} />
                </div>
            </div>
        </>
    )
}
