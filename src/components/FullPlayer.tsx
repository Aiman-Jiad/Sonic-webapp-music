import { usePlayer } from '@/state/player';
import { useLibrary } from '@/state/library';
import { useToast } from '@/state/library';
import { formatDuration, getFallbackImage } from '@/utils/helpers';
import { useRouter } from '@/state/router';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  X,
  ChevronDown,
  Volume2,
  VolumeX,
  ListMusic,
} from 'lucide-react';
import { useRef } from 'react';

export function FullPlayer() {
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
    isShuffled,
    toggleShuffle,
    repeat,
    cycleRepeat,
    isFullPlayerOpen,
    setFullPlayerOpen,
    setQueueOpen,
    isQueueOpen,
    queue,
    currentIndex,
    error,
  } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const progressRef = useRef<HTMLDivElement>(null);

  if (!isFullPlayerOpen || !currentTrack) return null;

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

  const liked = isLiked(currentTrack.id);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-950 animate-fade-in">
      {/* Background blur from artwork */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={currentTrack.image || getFallbackImage(currentTrack.name)}
          alt=""
          className="h-full w-full scale-150 object-cover opacity-20 blur-3xl"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/80 to-ink-950" />
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6 safe-area-top">
          <button
            onClick={() => setFullPlayerOpen(false)}
            className="rounded-full p-2 transition-colors hover:bg-ink-800"
            aria-label="Close full player"
          >
            <ChevronDown className="h-6 w-6 text-white" />
          </button>
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Now Playing
            </div>
            <div className="truncate text-sm font-medium text-white">
              {currentTrack.album_name}
            </div>
          </div>
          <button
            onClick={() => setQueueOpen(!isQueueOpen)}
            className={`rounded-full p-2 transition-colors hover:bg-ink-800 ${
              isQueueOpen ? 'text-sonic-500' : 'text-white'
            }`}
            aria-label="Toggle queue"
          >
            <ListMusic className="h-6 w-6" />
          </button>
        </div>

        {/* Main artwork area */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-4 sm:py-8">
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={currentTrack.image || getFallbackImage(currentTrack.name)}
              alt={currentTrack.name}
              className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = getFallbackImage(currentTrack.name); }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink-950/40">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="w-full max-w-md">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-bold text-white sm:text-2xl">
                  {currentTrack.name}
                </h2>
                <button
                  onClick={() => {
                    navigate(`/artist/${currentTrack.artist_id}`);
                    setFullPlayerOpen(false);
                  }}
                  className="truncate text-base text-ink-300 hover:text-white hover:underline"
                >
                  {currentTrack.artist_name}
                </button>
              </div>
              <button
                onClick={handleLike}
                className="shrink-0 rounded-full p-2 transition-colors hover:bg-ink-800"
                aria-label={liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
              >
                <Heart
                  className={`h-6 w-6 transition-all ${
                    liked ? 'fill-sonic-500 text-sonic-500 scale-110' : 'text-ink-300'
                  }`}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md">
            <div
              ref={progressRef}
              className="group relative h-1.5 cursor-pointer rounded-full bg-ink-600"
              onClick={handleProgressClick}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-sonic-500 transition-colors"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-lg transition-opacity group-hover:opacity-100 opacity-100"
                style={{ left: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs tabular-nums text-ink-400">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex w-full max-w-md items-center justify-between">
            <button
              onClick={toggleShuffle}
              className={`rounded-full p-2 transition-colors hover:bg-ink-800 ${
                isShuffled ? 'text-sonic-500' : 'text-ink-300'
              }`}
              aria-label="Shuffle"
              aria-pressed={isShuffled}
            >
              <Shuffle className="h-5 w-5" strokeWidth={isShuffled ? 2.5 : 2} />
            </button>
            <button
              onClick={previous}
              className="rounded-full p-2 text-white transition-colors hover:bg-ink-800"
              aria-label="Previous track"
            >
              <SkipBack className="h-7 w-7" fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink-950 transition-transform hover:scale-105 active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-ink-300 border-t-ink-950" />
              ) : isPlaying ? (
                <Pause className="h-7 w-7" fill="currentColor" />
              ) : (
                <Play className="ml-1 h-7 w-7" fill="currentColor" />
              )}
            </button>
            <button
              onClick={next}
              className="rounded-full p-2 text-white transition-colors hover:bg-ink-800"
              aria-label="Next track"
            >
              <SkipForward className="h-7 w-7" fill="currentColor" />
            </button>
            <button
              onClick={cycleRepeat}
              className={`rounded-full p-2 transition-colors hover:bg-ink-800 ${
                repeat !== 'off' ? 'text-sonic-500' : 'text-ink-300'
              }`}
              aria-label={`Repeat: ${repeat}`}
              aria-pressed={repeat !== 'off'}
            >
              {repeat === 'one' ? (
                <Repeat1 className="h-5 w-5" strokeWidth={2.5} />
              ) : (
                <Repeat className="h-5 w-5" strokeWidth={repeat !== 'off' ? 2.5 : 2} />
              )}
            </button>
          </div>

          {/* Volume */}
          <div className="hidden w-full max-w-md items-center gap-2 sm:flex">
            <button
              onClick={toggleMute}
              className="rounded-full p-1.5 text-ink-300 transition-colors hover:bg-ink-800 hover:text-white"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-ink-600 accent-sonic-500"
              aria-label="Volume"
            />
          </div>

          {error && (
            <div className="w-full max-w-md rounded-lg bg-red-500/10 px-4 py-2 text-center text-sm text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Queue panel */}
      {isQueueOpen && <QueuePanel />}
    </div>
  );
}

function QueuePanel() {
  const { queue, currentIndex, playTrack, removeFromQueue, setQueueOpen } = usePlayer();
  const { navigate } = useRouter();

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-ink-900/95 backdrop-blur-xl animate-slide-in-right sm:rounded-l-2xl">
      <div className="flex items-center justify-between px-4 py-4 border-b border-ink-700 safe-area-top">
        <h3 className="text-lg font-bold text-white">Queue</h3>
        <button
          onClick={() => setQueueOpen(false)}
          className="rounded-full p-2 text-ink-300 hover:bg-ink-800 hover:text-white"
          aria-label="Close queue"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
          Now Playing
        </div>
        {currentIndex >= 0 && queue[currentIndex] && (
          <QueueItem
            track={queue[currentIndex]}
            isActive
            index={currentIndex}
            onPlay={() => playTrack(queue[currentIndex], queue, currentIndex)}
            onRemove={() => removeFromQueue(currentIndex)}
            onArtistClick={() => navigate(`/artist/${queue[currentIndex].artist_id}`)}
          />
        )}
        <div className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-ink-400">
          Up Next ({Math.max(0, queue.length - currentIndex - 1)})
        </div>
        {queue.slice(currentIndex + 1).length === 0 ? (
          <div className="py-4 text-sm text-ink-400">No tracks in queue</div>
        ) : (
          queue.slice(currentIndex + 1).map((track, i) => {
            const actualIndex = currentIndex + 1 + i;
            return (
              <QueueItem
                key={`${track.id}-${actualIndex}`}
                track={track}
                index={actualIndex}
                onPlay={() => playTrack(track, queue, actualIndex)}
                onRemove={() => removeFromQueue(actualIndex)}
                onArtistClick={() => navigate(`/artist/${track.artist_id}`)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function QueueItem({
  track,
  isActive,
  index,
  onPlay,
  onRemove,
  onArtistClick,
}: {
  track: import('@/types').Track;
  isActive?: boolean;
  index: number;
  onPlay: () => void;
  onRemove: () => void;
  onArtistClick: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-3 rounded-md px-2 py-2 transition-colors ${
        isActive ? 'bg-ink-800/60' : 'hover:bg-ink-800/40'
      }`}
    >
      <button onClick={onPlay} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <img
          src={track.image || getFallbackImage(track.name)}
          alt=""
          className="h-10 w-10 shrink-0 rounded object-cover"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = getFallbackImage(track.name); }}
        />
        <div className="min-w-0 flex-1">
          <div className={`truncate text-sm font-medium ${isActive ? 'text-sonic-500' : 'text-white'}`}>
            {track.name}
          </div>
          <div className="truncate text-xs text-ink-400">{track.artist_name}</div>
        </div>
      </button>
      <span className="text-xs tabular-nums text-ink-400">{formatDuration(track.duration)}</span>
      <button
        onClick={onRemove}
        className="rounded-full p-1 text-ink-400 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
        aria-label="Remove from queue"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
