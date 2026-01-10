import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl"
import { MenuItemFollowCompTypes } from "@/app/types"
import { formatShortHash } from "@/lib/utils"
import Link from "next/link"
import { AiOutlineCheck } from "react-icons/ai"

export default function MenuItemFollow({ user }: MenuItemFollowCompTypes) {
    
    return (
        <>
            <Link 
                href={`/profile/${user?.id}`}
                className="flex items-center rounded-md w-full py-1.5 px-2 hover:bg-gray-100 dark:hover:bg-white/10"
            >
                <img 
                    className="rounded-full lg:mx-0 mx-auto" 
                    width="35" 
                    src={useCreateBucketUrl(user?.image)}
                />
                <div className="lg:pl-2.5 lg:block hidden">
                    <div className="flex items-center">
                        <p className="font-bold text-[14px] truncate dark:text-white">
                            {user?.name}
                        </p>
                        <p className="ml-1 rounded-full bg-[#58D5EC] h-[14px] relative">
                            <AiOutlineCheck className="relative p-[3px]" color="#FFFFFF" size="15"/>
                        </p>
                    </div>

                    <p className="font-light text-[12px] text-gray-600 dark:text-white/60">
                        {user?.username
                          ? `@${user.username}`
                          : `@${formatShortHash(user?.id || "")}`}
                    </p>
                </div>
            </Link>
        </>
    )
}
