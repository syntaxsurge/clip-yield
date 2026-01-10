import { AiFillHeart } from "react-icons/ai"
import { FaCommentDots, FaBolt, FaBullhorn } from "react-icons/fa"
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

export default function PostMainLikes({ post }: PostMainLikesCompTypes) {

    const contextUser = useUser()
    const [hasClickedLike, setHasClickedLike] = useState<boolean>(false)
    const [userLiked, setUserLiked] = useState<boolean>(false)
    const [comments, setComments] = useState<Comment[]>([])
    const [likes, setLikes] = useState<Like[]>([])

    useEffect(() => { 
        getAllLikesByPost()
        getAllCommentsByPost()
    }, [post])

    useEffect(() => { hasUserLikedPost() }, [likes, contextUser])

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

    return (
        <>
            <div
                id={`PostMainLikes-${post?.id}`}
                className="flex flex-col items-center justify-end gap-4 self-end pb-3 pl-3"
            >
                <div className="flex flex-col items-center gap-1 text-center">
                    <button 
                        disabled={hasClickedLike}
                        onClick={() => likeOrUnlike()} 
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white/80"
                        aria-label="Like"
                    >
                        {!hasClickedLike ? (
                            <AiFillHeart color={likes?.length > 0 && userLiked ? '#ff2626' : ''} size="24"/>
                        ) : (
                            <BiLoaderCircle className="animate-spin" size="24"/>
                        )}
                    </button>
                    <span className="text-[11px] font-semibold text-gray-800 dark:text-white/80">
                        {likes?.length}
                    </span>
                </div>

                <Link
                    href={`/post/${post?.id}/${post?.profile?.user_id}`}
                    className="flex flex-col items-center gap-1 text-center"
                    aria-label="View comments"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white/80">
                        <FaCommentDots size="22"/>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-800 dark:text-white/80">
                        {comments?.length}
                    </span>
                </Link>

                <Link
                    href={`/boost/${post?.profile?.user_id}`}
                    className="flex flex-col items-center gap-1 text-center"
                    aria-label="Boost creator"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white/80">
                        <FaBolt size="22"/>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-800 dark:text-white/80">
                        Boost
                    </span>
                </Link>

                <Link
                    href={`/sponsor/${post?.id}`}
                    className="flex flex-col items-center gap-1 text-center"
                    aria-label="Sponsor clip"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white/80">
                        <FaBullhorn size="21"/>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-800 dark:text-white/80">
                        Sponsor
                    </span>
                </Link>
            </div>
        </>
    )
}
