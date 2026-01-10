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
    const isProjectsRoute = pathname.startsWith("/projects")
    const defaultColor = "hsl(var(--foreground))"
    const activeColor = "var(--brand-accent-text)"

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
                className="fixed left-0 top-0 z-20 h-full w-[75px] overflow-auto border-r bg-white pt-[64px] lg:w-[310px] lg:border-r-0 dark:border-white/10 dark:bg-black"
            >
                
                <div className="lg:w-full w-[55px] mx-auto">
                    <Link href="/">
                        <MenuItem 
                            iconString="For You" 
                            colorString={pathname == '/' ? activeColor : defaultColor} 
                            sizeString="25"
                        />
                    </Link>
                    <Link href="/following">
                        <MenuItem
                            iconString="Following"
                            colorString={pathname == '/following' ? activeColor : defaultColor}
                            sizeString="25"
                        />
                    </Link>
                    <Link href="/projects">
                        <MenuItem
                            iconString="Projects"
                            colorString={isProjectsRoute ? activeColor : defaultColor}
                            sizeString="25"
                        />
                    </Link>

                    <div className="border-b lg:ml-2 mt-2 dark:border-white/10" />
                    <h3 className="lg:block hidden text-xs font-semibold text-gray-600 dark:text-white/60 pt-4 pb-2 px-2">
                        Suggested accounts
                    </h3>

                    <div className="lg:hidden block pt-3" />
                    <ClientOnly>
                        <div className="cursor-pointer">
                            {randomUsers?.map((user, index) => ( 
                                <MenuItemFollow key={index} user={user} /> 
                            ))}
                        </div>
                    </ClientOnly>

                    <button className="lg:block hidden text-[color:var(--brand-accent-text)] pt-1.5 pl-2 text-[13px] font-semibold">See all</button>

                    {contextUser?.user?.id ? (
                        <div >
                            <div className="border-b lg:ml-2 mt-2 dark:border-white/10" />
                            <h3 className="lg:block hidden text-xs font-semibold text-gray-600 dark:text-white/60 pt-4 pb-2 px-2">
                                Following accounts
                            </h3>

                            <div className="lg:hidden block pt-3" />
                            <ClientOnly>
                                <div className="cursor-pointer">
                                    {followingUsers.length > 0 ? (
                                        followingUsers.map((user, index) => ( 
                                            <MenuItemFollow key={index} user={user} /> 
                                        ))
                                    ) : (
                                        <div className="px-2 text-xs text-gray-500 dark:text-white/60">
                                            Follow creators to see them here.
                                        </div>
                                    )}
                                </div>
                            </ClientOnly>

                            <button className="lg:block hidden text-[color:var(--brand-accent-text)] pt-1.5 pl-2 text-[13px] font-semibold">See more</button>
                        </div>
                    ) : null}
                    <div className="lg:block hidden border-b lg:ml-2 mt-2 dark:border-white/10" />

                    <div className="lg:block hidden text-[11px] text-gray-500 dark:text-white/50">
                        <p className="pt-4 px-2">
                            About ClipYield Newsroom Contact Careers Partners
                        </p>
                        <p className="pt-4 px-2">
                            ClipYield for Good Advertise Developers Transparency Rewards
                        </p>
                        <p className="pt-4 px-2">
                            Help Safety Terms Privacy Creator Portal Community Guidelines
                        </p>
                        <p className="pt-4 px-2">© 2025 ClipYield</p>
                    </div>

                    <div className="pb-14"></div>
                </div>

            </div>
        </>
    )
}
