"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { FiMaximize, FiVolume, FiVolume1, FiVolume2, FiVolumeX } from "react-icons/fi";
import { useGeneralStore } from "@/app/stores/general";
import { cn } from "@/lib/utils";
import { VideoStatusOverlay } from "./VideoStatusOverlay";

type ClipVideoPlayerProps = {
  src: string;
  className?: string;
  videoClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  observeVisibility?: boolean;
  showLogo?: boolean;
  logoClassName?: string;
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

  const handleFullscreen = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const element = containerRef.current;
    if (!element) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    if (element.requestFullscreen) {
      void element.requestFullscreen();
    }
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
        "relative flex items-center justify-center overflow-hidden rounded-2xl bg-black",
        className,
      )}
      onClick={togglePlayback}
      onKeyDown={handleKeyToggle}
      role="button"
      tabIndex={0}
      aria-label="Toggle playback"
    >
      <video
        ref={videoRef}
        loop={loop}
        playsInline
        autoPlay={autoPlay}
        className={cn("h-full w-full object-cover", videoClassName)}
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 pt-6">
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
            background: `linear-gradient(to right, #ffffff ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
          }}
        />

        <div className="mt-2 flex items-center justify-between text-white">
          <div
            className="group relative flex items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Adjust volume"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              onClick={(event) => event.stopPropagation()}
            >
              <VolumeIcon size={18} />
            </button>
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-28 -translate-x-1/2 rounded-full bg-black/70 px-3 py-2 opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
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

          <button
            type="button"
            onClick={handleFullscreen}
            aria-label="Toggle fullscreen"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <FiMaximize size={18} />
          </button>
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
  );
}
