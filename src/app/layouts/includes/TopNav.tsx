"use client";

import Link from "next/link";
import { debounce } from "debounce";
import { useRouter } from "next/navigation";
import { BiSearch, BiUser } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { useState, type MouseEvent } from "react";
import { useUser } from "@/app/context/user";
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl";
import { RandomUsers } from "@/app/types";
import useSearchProfilesByName from "@/app/hooks/useSearchProfilesByName";
import ThemeToggle from "@/components/ui/theme-toggle";
import { formatShortHash } from "@/lib/utils";

export default function TopNav() {
    const userContext = useUser();
    const router = useRouter();
    const [searchProfiles, setSearchProfiles] = useState<RandomUsers[]>([]);
    const [showMenu, setShowMenu] = useState<boolean>(false);

    const handleSearchName = debounce(async (event: { target: { value: string } }) => {
        if (event.target.value == "") return setSearchProfiles([]);

        try {
            const result = await useSearchProfilesByName(event.target.value);
            if (result) return setSearchProfiles(result);
            setSearchProfiles([]);
        } catch (error) {
            console.log(error);
            setSearchProfiles([]);
            alert(error);
        }
    }, 500);

    const handleUploadClick = async (
        event: MouseEvent<HTMLAnchorElement>,
    ) => {
        if (!userContext?.user) {
            event.preventDefault();
            await userContext?.openConnect();
        }
    };

    return (
        <>
            <div
                id="TopNav"
                className="fixed left-0 top-0 z-30 flex h-[60px] w-full items-center border-b border-gray-200 bg-white dark:border-white/10 dark:bg-black"
            >
                <div className="flex items-center justify-between gap-6 w-full px-4 mx-auto max-w-[1150px]">

                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-white">
                            <img
                                className="h-full w-full object-cover"
                                src="/images/clip-yield-logo.png"
                                alt="ClipYield"
                            />
                        </span>
                        <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                            ClipYield
                        </span>
                    </Link>

                    <div className="relative hidden md:flex items-center justify-end rounded-full bg-[#F1F1F2] p-1 max-w-[430px] w-full dark:bg-white/10">
                            <input 
                                type="text" 
                                onChange={handleSearchName}
                                className="w-full pl-3 my-2 bg-transparent text-[15px] text-gray-900 placeholder-[#838383] focus:outline-none dark:text-white dark:placeholder-white/60"
                                placeholder="Search accounts"
                            />

                            {searchProfiles.length > 0 ?
                                <div className="absolute bg-white max-w-[910px] h-auto w-full z-20 left-0 top-12 border p-1 dark:border-white/10 dark:bg-[#0f0f12]">
                                    {searchProfiles.map((profile, index) => {
                                        const handle = profile?.username
                                            ? `@${profile.username}`
                                            : `@${formatShortHash(profile?.id ?? "")}`;
                                        return (
                                        <div className="p-1" key={index}>
                                            <Link 
                                                href={`/profile/${profile?.id}`}
                                                className="group flex items-center justify-between w-full cursor-pointer rounded-md p-1 px-2 text-gray-900 hover:bg-[color:var(--brand-accent)] hover:text-[color:var(--brand-ink)] dark:text-white"
                                            >
                                                <div className="flex items-center">
                                                    <img className="rounded-md" width="40" src={useCreateBucketUrl(profile?.image)} />
                                                    <div className="ml-2">
                                                        <div className="truncate font-semibold">{ profile?.name }</div>
                                                        <div className="text-xs text-gray-500 dark:text-white/60 group-hover:text-white/90">
                                                            {handle}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    )})}
                                </div>
                            : null}

                            <div className="px-3 py-1 flex items-center border-l border-l-gray-300 dark:border-l-white/10">
                                <BiSearch color="#A1A2A7" size="22" />
                            </div>
                    </div>

                    <div className="flex items-center gap-3">
                            <Link
                                href="/upload"
                                onClick={handleUploadClick}
                                className="flex items-center border rounded-sm py-[6px] hover:bg-gray-100 pl-1.5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                            >
                                <AiOutlinePlus color="currentColor" size="22"/>
                                <span className="px-2 font-semibold text-[15px]">Upload</span>
                            </Link>

                            <ThemeToggle />

                            {userContext?.isLoading ? (
                                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-gray-200 dark:border-white/10">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500 dark:border-white/30 dark:border-t-white" />
                                </div>
                            ) : !userContext?.user?.id ? (
                                <button
                                    onClick={() => void userContext?.openConnect()}
                                    className="flex items-center rounded-md border border-[color:var(--brand-accent)] bg-[color:var(--brand-accent)] px-3 py-[6px] text-[color:var(--brand-ink)] hover:bg-[color:var(--brand-accent-strong)]"
                                >
                                    <span className="whitespace-nowrap mx-4 font-semibold text-[15px]">Connect</span>
                                </button>
                            ) : (
                                <div className="flex items-center">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowMenu((prev) => !prev)}
                                            className="mt-1 border border-gray-200 rounded-full dark:border-white/10"
                                        >
                                            <img className="rounded-full w-[35px] h-[35px]" src={useCreateBucketUrl(userContext?.user?.image || '')} />
                                        </button>

                                        {showMenu ? (
                                            <div className="absolute bg-white rounded-lg py-1.5 w-[200px] shadow-xl border top-[40px] right-0 dark:border-white/10 dark:bg-[#0f0f12]">
                                                <button
                                                    onClick={() => {
                                                        router.push(`/profile/${userContext?.user?.id}`)
                                                        setShowMenu(false)
                                                    }}
                                                    className="flex items-center w-full justify-start py-3 px-2 text-gray-800 hover:bg-gray-100 cursor-pointer dark:text-white dark:hover:bg-white/10"
                                                >
                                                    <BiUser size="20"/>
                                                    <span className="pl-2 font-semibold text-sm">Profile</span>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        await userContext?.logout()
                                                        setShowMenu(false)
                                                    }}
                                                    className="flex items-center justify-start w-full py-3 px-1.5 hover:bg-gray-100 border-t cursor-pointer text-gray-800 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                                                >
                                                    <FiLogOut size={20} />
                                                    <span className="pl-2 font-semibold text-sm">Disconnect</span>
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </>
    )
}
  
