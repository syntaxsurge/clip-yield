"use client";

import Link from "next/link";
import { debounce } from "debounce";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { BiChevronDown, BiSearch, BiUser } from "react-icons/bi";
import { AiOutlineCopy, AiOutlinePlus } from "react-icons/ai";
import { FiCheck, FiLogOut, FiSettings } from "react-icons/fi";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { getAddress, isAddress } from "viem";
import { useUser } from "@/app/context/user";
import createBucketUrl from "@/app/hooks/useCreateBucketUrl";
import { RandomUsers } from "@/app/types";
import searchProfilesByName from "@/app/hooks/useSearchProfilesByName";
import ThemeToggle from "@/components/ui/theme-toggle";
import { PrivyConnectButton } from "@/components/ui/PrivyConnectButton";
import { isAdminAddress } from "@/lib/admin/adminAllowlist";
import { copyToClipboard, formatShortHash } from "@/lib/utils";
import { mantleConfig } from "@/lib/web3/mantleConfig";

export default function TopNav() {
    const userContext = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const { address } = useAccount();
    const chainId = useChainId();
    const [searchProfiles, setSearchProfiles] = useState<RandomUsers[]>([]);
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [showNavMenu, setShowNavMenu] = useState<boolean>(false);
    const [isCopying, setIsCopying] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);
    const isAdmin = useMemo(
        () => isAdminAddress(address ?? userContext?.user?.id ?? null),
        [address, userContext?.user?.id],
    );
    const profileImageUrl = createBucketUrl(userContext?.user?.image || "");
    const walletAddress = userContext?.user?.id ?? "";
    const normalizedWalletAddress = useMemo(() => {
        if (!walletAddress) return null;
        if (!isAddress(walletAddress)) return null;
        return getAddress(walletAddress);
    }, [walletAddress]);
    const isOnMantle = chainId === mantleConfig.chainId;
    const balancesEnabled = Boolean(showMenu && normalizedWalletAddress && isOnMantle);
    const nativeBalance = useBalance({
        address: normalizedWalletAddress ?? undefined,
        query: { enabled: balancesEnabled },
    });
    const wmntBalance = useBalance({
        address: normalizedWalletAddress ?? undefined,
        token: mantleConfig.wmntAddress,
        query: { enabled: balancesEnabled },
    });
    const mntBalanceLabel = !balancesEnabled
        ? "—"
        : nativeBalance.isLoading
            ? "Loading…"
            : nativeBalance.isError
                ? "—"
                : nativeBalance.data?.formatted ?? "0";
    const wmntBalanceLabel = !balancesEnabled
        ? "—"
        : wmntBalance.isLoading
            ? "Loading…"
            : wmntBalance.isError
                ? "—"
                : wmntBalance.data?.formatted ?? "0";
    const displayName = userContext?.user?.name?.trim() || "Creator";
    const userHandle = userContext?.user?.username
        ? `@${userContext.user.username}`
        : walletAddress
            ? `@${formatShortHash(walletAddress)}`
            : "@unknown";

    const navSections = useMemo(
        () => {
            const sections = [
                {
                    title: "RealFi actions",
                    links: [
                        { label: "Yield vault", href: "/yield" },
                        { label: "Creators (boost)", href: "/creators" },
                        { label: "Activity feed", href: "/activity" },
                        { label: "Leaderboard", href: "/leaderboard" },
                    ],
                },
                {
                    title: "Onboarding",
                    links: [
                        { label: "Start onboarding", href: "/start" },
                        { label: "KYC verification", href: "/kyc" },
                    ],
                },
                {
                    title: "Creator tools",
                    links: [
                        { label: "Projects", href: "/projects" },
                        { label: "Upload", href: "/upload" },
                    ],
                },
                {
                    title: "Perks",
                    links: [{ label: "Boost Pass perks", href: "/perks/boost-pass" }],
                },
            ];

            if (isAdmin) {
                sections.push({
                    title: "Admin",
                    links: [
                        { label: "KYC console", href: "/admin/kyc" },
                        { label: "Boost Pass admin", href: "/admin/boost-pass" },
                    ],
                });
            }

            return sections;
        },
        [isAdmin],
    );

    useEffect(() => {
        setShowMenu(false);
        setShowNavMenu(false);
    }, [pathname]);

    useEffect(() => {
        if (!hasCopied) return;
        const timer = window.setTimeout(() => setHasCopied(false), 2000);
        return () => window.clearTimeout(timer);
    }, [hasCopied]);

    const handleSearchName = debounce(async (event: { target: { value: string } }) => {
        if (event.target.value == "") return setSearchProfiles([]);

        try {
            const result = await searchProfilesByName(event.target.value);
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

    const handleCopyWallet = async () => {
        if (!walletAddress || isCopying) return;
        setIsCopying(true);
        const didCopy = await copyToClipboard(walletAddress);
        setIsCopying(false);
        setHasCopied(didCopy);
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
	                            <Image
	                                className="h-full w-full object-cover"
	                                src="/images/clip-yield-logo.png"
	                                alt="ClipYield"
	                                width={44}
	                                height={44}
	                                sizes="44px"
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
	                                                    <Image
	                                                        className="rounded-md object-cover"
	                                                        width={40}
	                                                        height={40}
	                                                        src={createBucketUrl(profile?.image)}
	                                                        alt={`${profile?.name ?? "Creator"} avatar`}
	                                                        unoptimized
	                                                        loader={({ src }) => src}
	                                                    />
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
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowNavMenu((prev) => !prev)}
                                    aria-expanded={showNavMenu}
                                    className="flex items-center gap-1 rounded-sm border border-gray-200 px-3 py-[6px] text-[15px] font-semibold text-gray-900 hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                                >
                                    Explore
                                    <BiChevronDown
                                        size={18}
                                        className={showNavMenu ? "rotate-180 transition-transform" : "transition-transform"}
                                    />
                                </button>

                                {showNavMenu ? (
                                    <div className="absolute right-0 top-[46px] w-[230px] rounded-lg border bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#0f0f12]">
                                        {navSections.map((section) => (
                                            <div key={section.title} className="space-y-1 pb-2">
                                                <div className="px-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/50">
                                                    {section.title}
                                                </div>
                                                {section.links.map((link) => (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
                                                        onClick={() => setShowNavMenu(false)}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
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
                                <PrivyConnectButton
                                    className="h-9 rounded-md border border-[color:var(--brand-accent)] bg-[color:var(--brand-accent)] px-4 text-[15px] text-[color:var(--brand-ink)] hover:bg-[color:var(--brand-accent-strong)]"
                                    size="sm"
                                    variant="default"
                                />
                            ) : (
                                <div className="flex items-center">
	                                    <div className="relative">
	                                        <button
	                                            type="button"
	                                            onClick={() => setShowMenu((prev) => !prev)}
	                                            aria-expanded={showMenu}
                                            aria-haspopup="menu"
	                                            aria-label="Open account menu"
	                                            className="mt-1 rounded-full border border-gray-200 ring-1 ring-transparent transition hover:ring-gray-200 dark:border-white/10 dark:hover:ring-white/20"
	                                        >
	                                            <Image
	                                                className="h-[35px] w-[35px] rounded-full object-cover"
	                                                src={profileImageUrl}
	                                                alt={`${displayName} avatar`}
	                                                width={35}
	                                                height={35}
	                                                sizes="35px"
	                                                unoptimized
	                                                loader={({ src }) => src}
	                                            />
	                                        </button>

                                        {showMenu ? (
                                            <div
                                                role="menu"
                                                className="absolute right-0 top-[48px] w-[280px] rounded-2xl border border-gray-200/80 bg-white/95 p-3 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-[#0f0f12]/95"
                                            >
                                                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-[#F6F6F8] p-3 dark:border-white/10 dark:from-[#15151c] dark:to-[#0f0f12]">
	                                                    <div className="flex items-center gap-3">
	                                                        <div className="h-11 w-11 overflow-hidden rounded-full border border-white/70 bg-gray-100 dark:border-white/10 dark:bg-white/10">
	                                                            <Image
	                                                                className="h-full w-full object-cover"
	                                                                src={profileImageUrl}
	                                                                alt={`${displayName} avatar`}
	                                                                width={44}
	                                                                height={44}
	                                                                sizes="44px"
	                                                                unoptimized
	                                                                loader={({ src }) => src}
	                                                            />
	                                                        </div>
	                                                        <div className="min-w-0">
	                                                            <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
	                                                                {displayName}
                                                            </div>
                                                            <div className="truncate text-xs text-gray-500 dark:text-white/60">
                                                                {userHandle}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 rounded-lg border border-gray-200/80 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-black/40">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/50">
                                                                Wallet
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => void handleCopyWallet()}
                                                                disabled={!walletAddress || isCopying}
                                                                className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
                                                                aria-label="Copy wallet address"
                                                            >
                                                                {hasCopied ? <FiCheck size={12} /> : <AiOutlineCopy size={12} />}
                                                                {hasCopied ? "Copied" : "Copy"}
                                                            </button>
                                                        </div>
                                                        <div
                                                            className="mt-1 break-all font-mono text-xs text-gray-700 dark:text-white/70"
                                                            title={walletAddress}
                                                        >
                                                            {walletAddress}
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-gray-500 dark:text-white/60">
                                                                    MNT balance
                                                                </span>
                                                                <span className="font-mono text-gray-700 dark:text-white/70">
                                                                    {mntBalanceLabel}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-gray-500 dark:text-white/60">
                                                                    WMNT balance
                                                                </span>
                                                                <span className="font-mono text-gray-700 dark:text-white/70">
                                                                    {wmntBalanceLabel}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 space-y-1">
                                                    <div className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/50">
                                                        Account
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            router.push(`/profile/${userContext?.user?.id}`)
                                                            setShowMenu(false)
                                                        }}
                                                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
                                                    >
                                                        <BiUser size={18} />
                                                        Profile
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            router.push("/settings")
                                                            setShowMenu(false)
                                                        }}
                                                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
                                                    >
                                                        <FiSettings size={18} />
                                                        Settings
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        await userContext?.logout()
                                                        setShowMenu(false)
                                                    }}
                                                    className="mt-3 flex w-full items-center gap-2 rounded-lg border-t border-gray-200 px-2 pt-3 text-sm font-semibold text-gray-800 transition hover:text-gray-900 dark:border-white/10 dark:text-white"
                                                >
                                                    <FiLogOut size={18} />
                                                    Disconnect
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
  
