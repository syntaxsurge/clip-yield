import { AiFillHeart } from "react-icons/ai"
import { FaShare, FaCommentDots, FaBolt, FaBullhorn } from "react-icons/fa"
import { useEffect, useState } from "react"
import { useUser } from "../context/user"
import { BiLoaderCircle } from "react-icons/bi"
import { useRouter } from "next/navigation"
import { Comment, Like, PostMainLikesCompTypes } from "../types"
import useGetCommentsByPostId from "../hooks/useGetCommentsByPostId"
import useGetLikesByPostId from "../hooks/useGetLikesByPostId"
import useIsLiked from "../hooks/useIsLiked"
import useCreateLike from "../hooks/useCreateLike"
import useDeleteLike from "../hooks/useDeleteLike"

export default function PostMainLikes({ post }: PostMainLikesCompTypes) {

    const router = useRouter()
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

    const boost = () => {
        if (!post?.profile?.user_id) return
        router.push(`/boost/${post.profile.user_id}`)
    }

    const sponsor = () => {
        if (!post?.id) return
        router.push(`/sponsor/${post.id}`)
    }

    return (
        <>
            <div id={`PostMainLikes-${post?.id}`} className="relative mr-[75px]">
                <div className="absolute bottom-0 pl-2">
                    <div className="pb-4 text-center">
                        <button 
                            disabled={hasClickedLike}
                            onClick={() => likeOrUnlike()} 
                            className="rounded-full bg-gray-200 p-2 cursor-pointer text-gray-700 dark:bg-white/10 dark:text-white/80"
                        >
                            {!hasClickedLike ? (
                                <AiFillHeart color={likes?.length > 0 && userLiked ? '#ff2626' : ''} size="25"/>
                            ) : (
                                <BiLoaderCircle className="animate-spin" size="25"/>
                            )}
                            
                        </button>
                        <span className="text-xs font-semibold text-gray-800 dark:text-white/80">
                            {likes?.length}
                        </span>
                    </div>

                    <button 
                        onClick={() => router.push(`/post/${post?.id}/${post?.profile?.user_id}`)} 
                        className="pb-4 text-center"
                    >
                        <div className="rounded-full bg-gray-200 p-2 cursor-pointer text-gray-700 dark:bg-white/10 dark:text-white/80">
                            <FaCommentDots size="25"/>
                        </div>
                        <span className="text-xs font-semibold text-gray-800 dark:text-white/80">{comments?.length}</span>
                    </button>

                    <button onClick={boost} className="pb-4 text-center">
                        <div className="rounded-full bg-gray-200 p-2 cursor-pointer text-gray-700 dark:bg-white/10 dark:text-white/80">
                            <FaBolt size="25"/>
                        </div>
                        <span className="text-xs font-semibold text-gray-800 dark:text-white/80">Boost</span>
                    </button>

                    <button onClick={sponsor} className="pb-4 text-center">
                        <div className="rounded-full bg-gray-200 p-2 cursor-pointer text-gray-700 dark:bg-white/10 dark:text-white/80">
                            <FaBullhorn size="24"/>
                        </div>
                        <span className="text-xs font-semibold text-gray-800 dark:text-white/80">Sponsor</span>
                    </button>

                    <button className="text-center">
                        <div className="rounded-full bg-gray-200 p-2 cursor-pointer text-gray-700 dark:bg-white/10 dark:text-white/80">
                            <FaShare size="25"/>
                        </div>
                        <span className="text-xs font-semibold text-gray-800 dark:text-white/80">55</span>
                    </button>
                </div>
            </div>
        </>
    )
}
