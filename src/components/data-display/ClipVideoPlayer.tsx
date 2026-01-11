"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { FiVolume, FiVolume1, FiVolume2, FiVolumeX } from "react-icons/fi";
import { useGeneralStore } from "@/app/stores/general";
import { cn } from "@/lib/utils";
import { VideoStatusOverlay } from "./VideoStatusOverlay";

type ClipVideoMeta = {
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
};

type ClipVideoPlayerProps = {
  src: string;
  className?: string;
  videoClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  observeVisibility?: boolean;
  showLogo?: boolean;
  logoClassName?: string;
  meta?: ClipVideoMeta;
  showMeta?: boolean;
  onEnded?: () => void;
};

const DEFAULT_VOLUME = 0.75;

export function ClipVideoPlayer({
  src,
  className,
  videoClassName,
  autoPlay = false,
  loop = true,
  observeVisibility = false,
  showLogo = true,
  logoClassName,
  meta,
  showMeta = true,
  onEnded,
}: ClipVideoPlayerProps) {
  const { feedVolume, setFeedVolume } = useGeneralStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch((error) => {
        if (error?.name !== "AbortError") {
          console.warn(error);
        }
      });
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = feedVolume;
    video.muted = feedVolume === 0;
  }, [feedVolume]);

  useEffect(() => {
    if (!autoPlay) return;
    safePlay();
  }, [autoPlay, safePlay]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!observeVisibility || !video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          if (video.paused) {
            safePlay();
          }
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: [0.6] },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [observeVisibility, safePlay]);

  useEffect(() => {
    setIsBuffering(true);
    setIsPaused(false);
    setHasPlayed(false);
    setDuration(0);
    setCurrentTime(0);
  }, [src]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? safePlay() : video.pause();
  };

  const handleKeyToggle = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePlayback();
    }
  };

  const handleTimeUpdate = () => {
    if (isSeeking) return;
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
    setCurrentTime(video.currentTime || 0);
  };

  const handleSeekChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Number(event.target.value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleSeekStart = (event: PointerEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setIsSeeking(true);
  };

  const handleSeekEnd = (event: PointerEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setIsSeeking(false);
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const value = Number(event.target.value) / 100;
    setFeedVolume(Number.isFinite(value) ? value : DEFAULT_VOLUME);
  };

  const handleVolumePointerDown = (event: PointerEvent<HTMLInputElement>) => {
    event.stopPropagation();
  };

  const showPausedOverlay = hasPlayed && isPaused;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const volumeIcon = useMemo(() => {
    if (feedVolume <= 0) return FiVolumeX;
    if (feedVolume < 0.33) return FiVolume;
    if (feedVolume < 0.66) return FiVolume1;
    return FiVolume2;
  }, [feedVolume]);

  const VolumeIcon = volumeIcon;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-visible",
        className,
      )}
      onClick={togglePlayback}
      onKeyDown={handleKeyToggle}
      role="button"
      tabIndex={0}
      aria-label="Toggle playback"
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          loop={loop}
          playsInline
          autoPlay={autoPlay}
          className={cn("h-full w-full object-contain", videoClassName)}
          src={src}
          onPlay={() => {
            setHasPlayed(true);
            setIsPaused(false);
          }}
          onPause={() => setIsPaused(true)}
          onWaiting={() => setIsBuffering(true)}
          onCanPlay={() => setIsBuffering(false)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPaused(false);
            setHasPlayed(true);
          }}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            if (onEnded) onEnded();
          }}
        />

        <VideoStatusOverlay isBuffering={isBuffering} isPaused={showPausedOverlay} />

        {meta && showMeta ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
            <div
              className="pointer-events-auto bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-6 pt-10 text-white"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="max-w-[72%] space-y-1 text-left drop-shadow">
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {meta.title}
                  {meta.badge}
                </div>
                {meta.description ? (
                  <p className="line-clamp-2 text-xs text-white/85">
                    {meta.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div
          className="absolute left-3 top-3 z-20 flex items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="group flex items-center gap-2 rounded-full bg-black/50 px-2 py-1.5 text-white">
            <button
              type="button"
              aria-label="Adjust volume"
              className="inline-flex h-8 w-8 items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <VolumeIcon size={18} />
            </button>
            <div className="pointer-events-none w-24 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(feedVolume * 100)}
                onChange={handleVolumeChange}
                onPointerDown={handleVolumePointerDown}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                aria-label="Volume"
                className="clip-slider h-1 w-full cursor-pointer rounded-full"
                style={{
                  background: `linear-gradient(to right, #ffffff ${
                    feedVolume * 100
                  }%, rgba(255,255,255,0.2) ${feedVolume * 100}%)`,
                }}
              />
            </div>
          </div>
        </div>

        {showLogo ? (
          <img
            className={cn("absolute right-2 bottom-10 w-[84px]", logoClassName)}
            src="/images/clip-yield-logo.png"
            alt="ClipYield"
          />
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full px-3">
        <div className="rounded-full bg-black/60 px-3 py-2 shadow-lg backdrop-blur">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            onPointerDown={handleSeekStart}
            onPointerUp={handleSeekEnd}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            aria-label="Playback position"
            className="clip-slider h-1 w-full cursor-pointer rounded-full"
            style={{
              background: `linear-gradient(to right, var(--clip-slider-fill) ${progress}%, var(--clip-slider-track) ${progress}%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
