import { usePlayer } from '@/state/player';
import { useLibrary } from '@/state/library';
import { useToast } from '@/state/library';
import { formatDuration, getFallbackImage } from '@/utils/helpers';
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, VolumeX } from 'lucide-react';
import { useRef } from 'react';
export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    togglePlay,
    next,
    previous,
    currentTime,
    duration,
    seek,
    volume,
    muted,
    toggleMute,
    setVolume,
    setFullPlayerOpen,
    isShuffled,
    error,
  } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const { showToast } = useToast();
  const progressRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * duration);
  };

  const handleLike = () => {
    const liked = toggleLike(currentTrack);
    showToast(liked ? 'Added to Liked Songs' : 'Removed from Liked Songs', liked ? 'success' : 'default');
  };

  return (
    <div className="glass relative flex items-center gap-3 border-t border-ink-700/50 px-3 py-2.5 sm:px-4 sm:py-3">
      {/* Track info - clickable to open full player */}
      <button
        onClick={() => setFullPlayerOpen(true)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        aria-label="Open full player"
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-ink-700 sm:h-14 sm:w-14">
          <img
            src={currentTrack.image || getFallbackImage(currentTrack.name)}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = getFallbackImage(currentTrack.name); }}
          />
          {isShuffled && (
            <div className="absolute bottom-0.5 right-0.5 rounded bg-ink-950/80 px-1 text-[8px] font-bold uppercase text-sonic-500">
              SHUF
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{currentTrack.name}</div>
          <div className="truncate text-xs text-ink-300">{currentTrack.artist_name}</div>
          {error && <div className="text-xs text-red-400">{error}</div>}
        </div>
      </button>

      {/* Controls - desktop */}
      <div className="hidden items-center gap-2 sm:flex">
        <button
          onClick={handleLike}
          className="rounded-full p-1.5 transition-colors hover:bg-ink-700/50"
          aria-label={isLiked(currentTrack.id) ? 'Unlike' : 'Like'}
        >
          <Heart
            className={`h-4 w-4 ${
              isLiked(currentTrack.id) ? 'fill-sonic-500 text-sonic-500' : 'text-ink-300'
            }`}
            strokeWidth={2}
          />
        </button>
        <button
          onClick={previous}
          className="rounded-full p-1.5 transition-colors hover:bg-ink-700/50"
          aria-label="Previous track"
        >
          <SkipBack className="h-4 w-4 text-ink-100" fill="currentColor" />
        </button>
        <button
          onClick={togglePlay}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-950 transition-transform hover:scale-105 active:scale-95"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-ink-950" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
          )}
        </button>
        <button
          onClick={next}
          className="rounded-full p-1.5 transition-colors hover:bg-ink-700/50"
          aria-label="Next track"
        >
          <SkipForward className="h-4 w-4 text-ink-100" fill="currentColor" />
        </button>
      </div>

      {/* Progress bar - desktop */}
      <div className="hidden flex-1 items-center gap-2 lg:flex">
        <span className="w-10 text-right text-xs tabular-nums text-ink-400">
          {formatDuration(currentTime)}
        </span>
        <div
          ref={progressRef}
          className="group relative h-1 flex-1 cursor-pointer rounded-full bg-ink-600"
          onClick={handleProgressClick}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-ink-300 group-hover:bg-sonic-500 transition-colors"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            style={{ left: `${progress}%` }}
          />
        </div>
        <span className="w-10 text-xs tabular-nums text-ink-400">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Volume - desktop only */}
      <div className="hidden items-center gap-2 xl:flex">
        <button
          onClick={toggleMute}
          className="rounded-full p-1.5 transition-colors hover:bg-ink-700/50"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted || volume === 0 ? (
            <VolumeX className="h-4 w-4 text-ink-300" />
          ) : (
            <Volume2 className="h-4 w-4 text-ink-300" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-ink-600 accent-sonic-500"
          aria-label="Volume"
        />
      </div>

      {/* Mobile controls */}
      <div className="flex items-center gap-1 sm:hidden">
        <button
          onClick={handleLike}
          className="rounded-full p-1.5"
          aria-label={isLiked(currentTrack.id) ? 'Unlike' : 'Like'}
        >
          <Heart
            className={`h-4 w-4 ${
              isLiked(currentTrack.id) ? 'fill-sonic-500 text-sonic-500' : 'text-ink-300'
            }`}
          />
        </button>
        <button
          onClick={togglePlay}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-950"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-ink-950" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
          )}
        </button>
        <button
          onClick={next}
          className="rounded-full p-1.5"
          aria-label="Next track"
        >
          <SkipForward className="h-4 w-4 text-ink-100" fill="currentColor" />
        </button>
      </div>

      {/* Mobile progress bar - thin line at bottom */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-ink-600">
        <div
          className="h-full bg-sonic-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
