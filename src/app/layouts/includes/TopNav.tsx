"use client";

import Link from "next/link";
import { debounce } from "debounce";
import { useRouter } from "next/navigation";
import { BiSearch, BiUser } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { useState } from "react";
import { useUser } from "@/app/context/user";
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl";
import { RandomUsers } from "@/app/types";
import useSearchProfilesByName from "@/app/hooks/useSearchProfilesByName";
import ThemeToggle from "@/components/ui/theme-toggle";

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

    const goTo = async () => {
        if (!userContext?.user) {
            await userContext?.openConnect();
            return;
        }
        router.push("/upload");
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
                                <div className="absolute bg-white max-w-[910px] h-auto w-full z-20 left-0 top-12 border p-1">
                                    {searchProfiles.map((profile, index) => (
                                        <div className="p-1" key={index}>
                                            <Link 
                                                href={`/profile/${profile?.id}`}
                                                className="flex items-center justify-between w-full cursor-pointer hover:bg-[#F12B56] p-1 px-2 hover:text-white"
                                            >
                                                <div className="flex items-center">
                                                    <img className="rounded-md" width="40" src={useCreateBucketUrl(profile?.image)} />
                                                    <div className="truncate ml-2">{ profile?.name }</div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            : null}

                            <div className="px-3 py-1 flex items-center border-l border-l-gray-300">
                                <BiSearch color="#A1A2A7" size="22" />
                            </div>
                    </div>

                    <div className="flex items-center gap-3">
                            <button
                                onClick={() => void goTo()}
                                className="flex items-center border rounded-sm py-[6px] hover:bg-gray-100 pl-1.5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                            >
                                <AiOutlinePlus color="currentColor" size="22"/>
                                <span className="px-2 font-medium text-[15px]">Upload</span>
                            </button>

                            <ThemeToggle />

                            {userContext?.isLoading ? (
                                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-gray-200 dark:border-white/10">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500 dark:border-white/30 dark:border-t-white" />
                                </div>
                            ) : !userContext?.user?.id ? (
                                <button
                                    onClick={() => void userContext?.openConnect()}
                                    className="flex items-center bg-[#F02C56] text-white border rounded-md px-3 py-[6px]"
                                >
                                    <span className="whitespace-nowrap mx-4 font-medium text-[15px]">Connect</span>
                                </button>
                            ) : (
                                <div className="flex items-center">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowMenu((prev) => !prev)}
                                            className="mt-1 border border-gray-200 rounded-full"
                                        >
                                            <img className="rounded-full w-[35px] h-[35px]" src={useCreateBucketUrl(userContext?.user?.image || '')} />
                                        </button>

                                        {showMenu ? (
                                            <div className="absolute bg-white rounded-lg py-1.5 w-[200px] shadow-xl border top-[40px] right-0">
                                                <button
                                                    onClick={() => {
                                                        router.push(`/profile/${userContext?.user?.id}`)
                                                        setShowMenu(false)
                                                    }}
                                                    className="flex items-center w-full justify-start py-3 px-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <BiUser size="20"/>
                                                    <span className="pl-2 font-semibold text-sm">Profile</span>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        await userContext?.logout()
                                                        setShowMenu(false)
                                                    }}
                                                    className="flex items-center justify-start w-full py-3 px-1.5 hover:bg-gray-100 border-t cursor-pointer"
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
  
