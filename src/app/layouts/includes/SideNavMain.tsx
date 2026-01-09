"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuItem from "./MenuItem";
import MenuItemFollow from "./MenuItemFollow";
import { useEffect, useState } from "react";
import { useUser } from "@/app/context/user";
import ClientOnly from "@/app/components/ClientOnly";
import { useGeneralStore } from "@/app/stores/general";
import useGetFollowingProfiles from "@/app/hooks/useGetFollowingProfiles";
import type { RandomUsers } from "@/app/types";

export default function SideNavMain() {

    let { setRandomUsers, randomUsers} = useGeneralStore()
    const [followingUsers, setFollowingUsers] = useState<RandomUsers[]>([])

    const contextUser = useUser()
    const pathname = usePathname()

    useEffect(() => { setRandomUsers() }, [setRandomUsers])

    useEffect(() => {
        if (!contextUser?.user?.id) {
            setFollowingUsers([])
            return
        }

        let isMounted = true

        const loadFollowing = async () => {
            try {
                const result = await useGetFollowingProfiles(contextUser.user.id, 6)
                if (!isMounted) return
                setFollowingUsers(result)
            } catch {
                if (!isMounted) return
                setFollowingUsers([])
            }
        }

        loadFollowing()

        return () => {
            isMounted = false
        }
    }, [contextUser?.user?.id])
    return (
        <>
            <div 
                id="SideNavMain" 
                className="fixed z-20 bg-white pt-[70px] h-full lg:border-r-0 border-r w-[75px] overflow-auto lg:w-[310px]"
            >
                
                <div className="lg:w-full w-[55px] mx-auto">
                    <Link href="/">
                        <MenuItem 
                            iconString="For You" 
                            colorString={pathname == '/' ? '#F02C56' : '#000000'} 
                            sizeString="25"
                        />
                    </Link>
                    <Link href="/following">
                        <MenuItem
                            iconString="Following"
                            colorString={pathname == '/following' ? '#F02C56' : '#000000'}
                            sizeString="25"
                        />
                    </Link>
                    <Link href="/live">
                        <MenuItem
                            iconString="LIVE"
                            colorString={pathname == '/live' ? '#F02C56' : '#000000'}
                            sizeString="25"
                        />
                    </Link>
                    <Link href="/projects">
                        <MenuItem
                            iconString="Projects"
                            colorString={pathname == '/projects' ? '#F02C56' : '#000000'}
                            sizeString="25"
                        />
                    </Link>

                    <div className="border-b lg:ml-2 mt-2" />
                    <h3 className="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">Suggested accounts</h3>

                    <div className="lg:hidden block pt-3" />
                    <ClientOnly>
                        <div className="cursor-pointer">
                            {randomUsers?.map((user, index) => ( 
                                <MenuItemFollow key={index} user={user} /> 
                            ))}
                        </div>
                    </ClientOnly>

                    <button className="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px]">See all</button>

                    {contextUser?.user?.id ? (
                        <div >
                            <div className="border-b lg:ml-2 mt-2" />
                            <h3 className="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">Following accounts</h3>

                            <div className="lg:hidden block pt-3" />
                            <ClientOnly>
                                <div className="cursor-pointer">
                                    {followingUsers.length > 0 ? (
                                        followingUsers.map((user, index) => ( 
                                            <MenuItemFollow key={index} user={user} /> 
                                        ))
                                    ) : (
                                        <div className="px-2 text-xs text-gray-500">
                                            Follow creators to see them here.
                                        </div>
                                    )}
                                </div>
                            </ClientOnly>

                            <button className="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px]">See more</button>
                        </div>
                    ) : null}
                    <div className="lg:block hidden border-b lg:ml-2 mt-2" />

                    <div className="lg:block hidden text-[11px] text-gray-500">
                        <p className="pt-4 px-2">About Newsroom TikTok Shop Contact Careers ByteDance</p>
                        <p className="pt-4 px-2">TikTok for Good Advertise Developers Transparency TikTok Rewards TikTok Browse TikTok Embeds</p>
                        <p className="pt-4 px-2">Help Safety Terms Privacy Creator Portal Community Guidelines</p>
                        <p className="pt-4 px-2">© 2023 TikTok</p>
                    </div>

                    <div className="pb-14"></div>
                </div>

            </div>
        </>
    )
}
