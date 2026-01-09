"use client"

import { AiFillHeart } from "react-icons/ai"
import { ImMusic } from "react-icons/im"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import PostMainLikes from "./PostMainLikes"
import useCreateBucketUrl from "../hooks/useCreateBucketUrl"
import { PostMainCompTypes } from "../types"
import useGetSponsorCampaignByPostId from "../hooks/useGetSponsorCampaignByPostId"
import { isSponsorCampaignActive } from "@/features/sponsor/utils"
import type { SponsorCampaign } from "@/app/types"

export default function PostMain({ post }: PostMainCompTypes) {
    const [sponsorCampaign, setSponsorCampaign] = useState<SponsorCampaign | null>(null)

    useEffect(() => {
        const video = document.getElementById(`video-${post?.id}`) as HTMLVideoElement
        const postMainElement = document.getElementById(`PostMain-${post.id}`);

        if (postMainElement) {
            let observer = new IntersectionObserver((entries) => {
                entries[0].isIntersecting ? video.play() : video.pause()
            }, { threshold: [0.6] });
        
            observer.observe(postMainElement);
        }
    }, [])

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

    const isSponsored = useMemo(() => {
        return isSponsorCampaignActive(sponsorCampaign)
    }, [sponsorCampaign])

    return (
        <>
            <div id={`PostMain-${post.id}`} className="flex border-b py-6">

                <div className="cursor-pointer">
                    <img className="rounded-full max-h-[60px]" width="60" src={useCreateBucketUrl(post?.profile?.image)} />
                </div>

                <div className="pl-3 w-full px-4">
                    <div className="flex items-center justify-between pb-0.5">
                        <Link href={`/profile/${post.profile.user_id}`}>
                            <span className="font-bold hover:underline cursor-pointer">
                                {post.profile.name}
                            </span>
                        </Link>

                        <div className="flex items-center gap-2">
                            {isSponsored ? (
                                <Link
                                    href={`/sponsor/${post.id}`}
                                    className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700"
                                >
                                    Sponsored
                                </Link>
                            ) : null}
                            <Link
                                href={`/sponsor/${post.id}`}
                                className="rounded-md border border-slate-200 px-3 py-1 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Sponsor
                            </Link>
                            <button className="border text-[15px] px-[21px] py-0.5 border-[#F02C56] text-[#F02C56] hover:bg-[#ffeef2] font-semibold rounded-md">
                                Follow
                            </button>
                        </div>
                    </div>
                    <p className="text-[15px] pb-0.5 break-words md:max-w-[400px] max-w-[300px]">{post.text}</p>
                    <p className="text-[14px] text-gray-500 pb-0.5">#fun #cool #SuperAwesome</p>
                    <p className="text-[14px] pb-0.5 flex items-center font-semibold">
                        <ImMusic size="17"/>
                        <span className="px-1">original sound - AWESOME</span>
                        <AiFillHeart size="20"/>
                    </p>

                    <div className="mt-2.5 flex">
                        <div
                            className="relative min-h-[480px] max-h-[580px] max-w-[260px] flex items-center bg-black rounded-xl cursor-pointer"
                        >
                            <video 
                                id={`video-${post.id}`}
                                loop
                                controls
                                muted
                                className="rounded-xl object-cover mx-auto h-full" 
                                src={useCreateBucketUrl(post?.video_url, "")}
                            />
                            <img 
                                className="absolute right-2 bottom-10" 
                                width="90" 
                                src="/images/tiktok-logo-white.png"
                            />
                        </div>
                        
                        <PostMainLikes post={post} />
                    </div>
                </div>
            </div>
        </>
    )
}
