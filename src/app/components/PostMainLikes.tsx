import { AiFillHeart } from "react-icons/ai"
import { FaCommentDots, FaBolt, FaBullhorn } from "react-icons/fa"
import { FiCheck, FiPlus } from "react-icons/fi"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useUser } from "../context/user"
import { BiLoaderCircle } from "react-icons/bi"
import { Comment, Like, PostMainLikesCompTypes } from "../types"
import useGetCommentsByPostId from "../hooks/useGetCommentsByPostId"
import useGetLikesByPostId from "../hooks/useGetLikesByPostId"
import useIsLiked from "../hooks/useIsLiked"
import useCreateLike from "../hooks/useCreateLike"
import useDeleteLike from "../hooks/useDeleteLike"
import useIsFollowing from "../hooks/useIsFollowing"
import useToggleFollow from "../hooks/useToggleFollow"
import { cn } from "@/lib/utils"

type PostMainLikesProps = PostMainLikesCompTypes & {
    className?: string
    avatarUrl?: string
    profileUrl?: string
}

export default function PostMainLikes({ post, className, avatarUrl, profileUrl }: PostMainLikesProps) {

    const contextUser = useUser()
    const [hasClickedLike, setHasClickedLike] = useState<boolean>(false)
    const [userLiked, setUserLiked] = useState<boolean>(false)
    const [comments, setComments] = useState<Comment[]>([])
    const [likes, setLikes] = useState<Like[]>([])
    const [isFollowing, setIsFollowing] = useState(false)
    const [isFollowLoading, setIsFollowLoading] = useState(false)

    useEffect(() => { 
        getAllLikesByPost()
        getAllCommentsByPost()
    }, [post])

    useEffect(() => { hasUserLikedPost() }, [likes, contextUser])

    useEffect(() => {
        let isMounted = true

        const loadFollowState = async () => {
            if (!contextUser?.user?.id || contextUser.user.id === post.profile.user_id) {
                if (isMounted) setIsFollowing(false)
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

    const getAllCommentsByPost = async () => {
        let result = await useGetCommentsByPostId(post?.id)
        setComments(result)
    }

    const getAllLikesByPost = async () => {
        let result = await useGetLikesByPostId(post?.id)
        setLikes(result)
    }

    const hasUserLikedPost = () => {
        if (!contextUser) return

        if (likes?.length < 1 || !contextUser?.user?.id) {
            setUserLiked(false)
            return
        }
        let res = useIsLiked(contextUser?.user?.id, post?.id, likes)
        setUserLiked(res ? true : false)
    }

    const like = async () => {
        setHasClickedLike(true)
        await useCreateLike(contextUser?.user?.id || '', post?.id)
        await getAllLikesByPost()
        hasUserLikedPost()
        setHasClickedLike(false)
    }

    const unlike = async (postId: string, userId: string) => {
        setHasClickedLike(true)
        await useDeleteLike(postId, userId)
        await getAllLikesByPost()
        hasUserLikedPost()
        setHasClickedLike(false)
    }

    const likeOrUnlike = () => {
        if (!contextUser?.user?.id) {
            void contextUser?.openConnect()
            return
        }
        
        let res = useIsLiked(contextUser?.user?.id, post?.id, likes)

        if (!res) {
            like()
        } else {
            likes.forEach((like: Like) => {
                if (contextUser?.user?.id == like?.user_id && like?.post_id == post?.id) {
                    void unlike(post?.id, contextUser?.user?.id)
                }
            })
        }
    }

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

    const showFollow = Boolean(
        contextUser?.user?.id && contextUser.user.id !== post.profile.user_id,
    )

    return (
        <>
            <div
                id={`PostMainLikes-${post?.id}`}
                className={cn(
                    "flex flex-col items-center justify-end gap-4",
                    className,
                )}
            >
                {avatarUrl && profileUrl ? (
                    <div className="relative flex flex-col items-center">
                        <Link
                            href={profileUrl}
                            className="relative block h-12 w-12 overflow-hidden rounded-full border-2 border-white/80 shadow-lg"
                            aria-label="View creator profile"
                        >
                            <img
                                className="h-full w-full object-cover"
                                src={avatarUrl}
                                alt={post.profile.name}
                            />
                        </Link>
                        {showFollow && (
                            <button
                                type="button"
                                onClick={() => void handleFollow()}
                                disabled={isFollowLoading}
                                aria-label={isFollowing ? "Following creator" : "Follow creator"}
                                className="absolute -bottom-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[color:var(--brand-accent)] text-[color:var(--brand-ink)] shadow-lg"
                            >
                                {isFollowing ? <FiCheck size={14} /> : <FiPlus size={14} />}
                            </button>
                        )}
                    </div>
                ) : null}

                <div className="flex flex-col items-center gap-1 text-center">
                    <button 
                        disabled={hasClickedLike}
                        onClick={() => likeOrUnlike()} 
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition hover:bg-black/70"
                        aria-label="Like"
                    >
                        {!hasClickedLike ? (
                            <AiFillHeart color={likes?.length > 0 && userLiked ? 'var(--brand-accent)' : ''} size="24"/>
                        ) : (
                            <BiLoaderCircle className="animate-spin" size="24"/>
                        )}
                    </button>
                    <span className="text-[11px] font-semibold text-white/80">
                        {likes?.length}
                    </span>
                </div>

                <Link
                    href={`/post/${post?.id}/${post?.profile?.user_id}`}
                    className="flex flex-col items-center gap-1 text-center"
                    aria-label="View comments"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition hover:bg-black/70">
                        <FaCommentDots size="22"/>
                    </div>
                    <span className="text-[11px] font-semibold text-white/80">
                        {comments?.length}
                    </span>
                </Link>

                <Link
                    href={`/boost/${post?.profile?.user_id}`}
                    className="flex flex-col items-center gap-1 text-center"
                    aria-label="Boost creator"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition hover:bg-black/70">
                        <FaBolt size="22"/>
                    </div>
                    <span className="text-[11px] font-semibold text-white/80">
                        Boost
                    </span>
                </Link>

                <Link
                    href={`/sponsor/${post?.id}`}
                    className="flex flex-col items-center gap-1 text-center"
                    aria-label="Sponsor clip"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition hover:bg-black/70">
                        <FaBullhorn size="21"/>
                    </div>
                    <span className="text-[11px] font-semibold text-white/80">
                        Sponsor
                    </span>
                </Link>
            </div>
        </>
    )
}
