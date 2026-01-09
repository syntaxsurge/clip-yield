"use client"

import Link from "next/link"
import PostUser from "@/app/components/profile/PostUser"
import MainLayout from "@/app/layouts/MainLayout"
import { use, useEffect, useState } from "react"
import { BsPencil } from "react-icons/bs"
import { useUser } from "@/app/context/user"
import ClientOnly from "@/app/components/ClientOnly"
import { ProfilePageTypes, PostWithProfile, User } from "@/app/types"
import { usePostStore } from "@/app/stores/post"
import { useProfileStore } from "@/app/stores/profile"
import { useGeneralStore } from "@/app/stores/general"
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl"
import useGetFollowerCount from "@/app/hooks/useGetFollowerCount"
import useGetFollowingCount from "@/app/hooks/useGetFollowingCount"
import useGetLikedPostsByUserId from "@/app/hooks/useGetLikedPostsByUserId"
import useIsFollowing from "@/app/hooks/useIsFollowing"
import useToggleFollow from "@/app/hooks/useToggleFollow"

export default function Profile({ params }: ProfilePageTypes) {
    const contextUser = useUser()
    let { postsByUser, setPostsByUser } = usePostStore()
    let { setCurrentProfile, currentProfile } = useProfileStore()
    let { isEditProfileOpen, setIsEditProfileOpen } = useGeneralStore()
    const { id } = use(params)
    const [followerCount, setFollowerCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [isFollowing, setIsFollowing] = useState(false)
    const [isFollowLoading, setIsFollowLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<"videos" | "liked">("videos")
    const [likedPosts, setLikedPosts] = useState<PostWithProfile[]>([])
    const [likedStatus, setLikedStatus] = useState<"idle" | "loading">("idle")

    useEffect(() => {
        setCurrentProfile(id)
        setPostsByUser(id)
    }, [id, setCurrentProfile, setPostsByUser])

    useEffect(() => {
        let isMounted = true

        const loadCounts = async () => {
            try {
                const [followers, following] = await Promise.all([
                    useGetFollowerCount(id),
                    useGetFollowingCount(id),
                ])
                if (!isMounted) return
                setFollowerCount(followers)
                setFollowingCount(following)
            } catch {
                if (!isMounted) return
                setFollowerCount(0)
                setFollowingCount(0)
            }
        }

        loadCounts()

        return () => {
            isMounted = false
        }
    }, [id])

    useEffect(() => {
        let isMounted = true

        const loadFollowingState = async () => {
            if (!contextUser?.user?.id || contextUser.user.id === id) {
                setIsFollowing(false)
                return
            }
            try {
                const result = await useIsFollowing(contextUser.user.id, id)
                if (!isMounted) return
                setIsFollowing(result)
            } catch {
                if (!isMounted) return
                setIsFollowing(false)
            }
        }

        loadFollowingState()

        return () => {
            isMounted = false
        }
    }, [contextUser?.user?.id, id])

    useEffect(() => {
        if (activeTab !== "liked") return

        let isMounted = true
        setLikedStatus("loading")

        const loadLiked = async () => {
            try {
                const results = await useGetLikedPostsByUserId(id)
                if (!isMounted) return
                setLikedPosts(results)
            } catch {
                if (!isMounted) return
                setLikedPosts([])
            } finally {
                if (isMounted) {
                    setLikedStatus("idle")
                }
            }
        }

        loadLiked()

        return () => {
            isMounted = false
        }
    }, [activeTab, id])

    const handleFollow = async () => {
        if (!contextUser?.user?.id) {
            await contextUser?.openConnect()
            return
        }
        if (contextUser.user.id === id) return

        try {
            setIsFollowLoading(true)
            const nextState = await useToggleFollow(contextUser.user.id, id)
            setIsFollowing(nextState)
            setFollowerCount((prev) => Math.max(0, prev + (nextState ? 1 : -1)))
        } catch (error) {
            console.error(error)
        } finally {
            setIsFollowLoading(false)
        }
    }

    return (
        <>
            <MainLayout>
                <div className="pt-[90px] ml-[90px] 2xl:pl-[185px] lg:pl-[160px] lg:pr-0 w-[calc(100%-90px)] pr-3 max-w-[1800px] 2xl:mx-auto">

                    <div className="flex w-[calc(100vw-230px)]">

                        <ClientOnly>
                            {currentProfile ? (
                                <img className="w-[120px] min-w-[120px] rounded-full" src={useCreateBucketUrl(currentProfile?.image)} />
                            ) : (
                                <div className="min-w-[150px] h-[120px] bg-gray-200 rounded-full" />
                            )}
                        </ClientOnly>

                        <div className="ml-5 w-full">
                            <ClientOnly>
                                {(currentProfile as User)?.name ? (
                                    <div>
                                        <p className="text-[30px] font-bold truncate">{currentProfile?.name}</p>
                                        <p className="text-[18px] truncate">{currentProfile?.name}</p>
                                    </div>
                                ) : (
                                    <div className="h-[60px]" />
                                )}
                            </ClientOnly>

                            
                            {contextUser?.user?.id === id ? (
                                <button
                                    onClick={() => setIsEditProfileOpen(!isEditProfileOpen)}
                                    className="flex item-center rounded-md py-1.5 px-3.5 mt-3 text-[15px] font-semibold border hover:bg-gray-100"
                                >
                                    <BsPencil className="mt-0.5 mr-1" size="18"/>
                                    <span>Edit profile</span>
                                </button>
                            ) : (
                                <div className="mt-3 flex flex-wrap gap-3">
                                    <button
                                        onClick={() => void handleFollow()}
                                        disabled={isFollowLoading}
                                        aria-pressed={isFollowing}
                                        className={`flex item-center rounded-md py-1.5 px-6 text-[15px] font-semibold border ${
                                            isFollowing
                                                ? "border-gray-200 text-gray-700 hover:bg-gray-100"
                                                : "border-[#F02C56] bg-[#F02C56] text-white hover:bg-[#e0264c]"
                                        }`}
                                    >
                                        {isFollowing ? "Following" : "Follow"}
                                    </button>
                                    <Link
                                        href={`/boost/${id}`}
                                        className="flex item-center rounded-md border border-[#F02C56] px-6 py-1.5 text-[15px] font-semibold text-[#F02C56] hover:bg-[#ffeef2]"
                                    >
                                        Boost with yield
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="flex items-center pt-4">
                        <div className="mr-4">
                            <span className="font-bold">{followingCount}</span>
                            <span className="text-gray-500 font-light text-[15px] pl-1.5">Following</span>
                        </div>
                        <div className="mr-4">
                            <span className="font-bold">{followerCount}</span>
                            <span className="text-gray-500 font-light text-[15px] pl-1.5">Followers</span>
                        </div>
                    </div>

                    <ClientOnly>
                        <p className="pt-4 mr-4 text-gray-500 font-light text-[15px] pl-1.5 max-w-[500px]">
                            {currentProfile?.bio}
                        </p>
                    </ClientOnly>

                    <ul className="w-full flex items-center pt-4 border-b">
                        <li className="w-60 text-center">
                            <button
                                onClick={() => setActiveTab("videos")}
                                className={`w-full py-2 text-[17px] font-semibold ${
                                    activeTab === "videos"
                                        ? "border-b-2 border-b-black text-black"
                                        : "text-gray-500"
                                }`}
                            >
                                Videos
                            </button>
                        </li>
                        <li className="w-60 text-center">
                            <button
                                onClick={() => setActiveTab("liked")}
                                className={`w-full py-2 text-[17px] font-semibold ${
                                    activeTab === "liked"
                                        ? "border-b-2 border-b-black text-black"
                                        : "text-gray-500"
                                }`}
                            >
                                Liked
                            </button>
                        </li>
                    </ul>

                    <ClientOnly>
                        {activeTab === "liked" && likedStatus === "loading" ? (
                            <div className="mt-6 text-sm text-gray-500">
                                Loading liked clips...
                            </div>
                        ) : (
                            <div className="mt-4 grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3">
                                {(activeTab === "videos" ? postsByUser : likedPosts)?.map((post, index) => (
                                    <PostUser key={index} post={post} />
                                ))}
                            </div>
                        )}
                        {activeTab === "videos" && postsByUser.length === 0 ? (
                            <div className="mt-6 text-sm text-gray-500">
                                No clips yet. Upload a new video to get started.
                            </div>
                        ) : null}
                        {activeTab === "liked" && likedStatus === "idle" && likedPosts.length === 0 ? (
                            <div className="mt-6 text-sm text-gray-500">
                                No liked clips yet. Tap the heart on a video to save it here.
                            </div>
                        ) : null}
                    </ClientOnly>

                    <div className="pb-20" />
                </div>
            </MainLayout>
        </>
    )
}
