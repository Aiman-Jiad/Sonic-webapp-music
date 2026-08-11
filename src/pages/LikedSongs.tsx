import { useMemo } from 'react';
import { usePlayer } from '@/state/player';
import { useLibrary } from '@/state/library';
import { useToast } from '@/state/library';
import { TrackRow } from '@/components/cards';
import { formatTotalDuration } from '@/utils/helpers';
import { Play, Shuffle, Heart } from 'lucide-react';
import { useRouter } from '@/state/router';

export function LikedSongsPage() {
  const { likedTracks, removeLiked } = useLibrary();
  const { playQueue, toggleShuffle, isShuffled } = usePlayer();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const totalDuration = useMemo(
    () => likedTracks.reduce((sum, t) => sum + t.duration, 0),
    [likedTracks]
  );

  const handlePlayAll = () => {
    if (likedTracks.length > 0) playQueue(likedTracks);
  };

  const handleShufflePlay = () => {
    if (!isShuffled) toggleShuffle();
    if (likedTracks.length > 0) playQueue(likedTracks);
  };

  if (likedTracks.length === 0) {
    return (
      <div className="space-y-6 pb-6">
        <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sonic-500 to-sonic-700 shadow-2xl sm:h-48 sm:w-48">
            <Heart className="h-16 w-16 fill-white text-white" strokeWidth={0} />
          </div>
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">Playlist</div>
            <h1 className="text-3xl font-extrabold text-white sm:text-5xl">Liked Songs</h1>
            <div className="text-xs text-ink-400">0 songs</div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="mb-3 h-10 w-10 text-ink-400" />
          <p className="mb-1 text-lg font-semibold text-white">Songs you like will appear here</p>
          <p className="mb-4 text-sm text-ink-400">
            Tap the heart icon on any song to save it to your Liked Songs.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="rounded-full bg-sonic-500 px-5 py-2 text-sm font-bold text-ink-950 hover:bg-sonic-400"
          >
            Find Songs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sonic-500 to-sonic-700 shadow-2xl sm:h-48 sm:w-48">
          <Heart className="h-16 w-16 fill-white text-white" strokeWidth={0} />
        </div>
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">Playlist</div>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">Liked Songs</h1>
          <div className="flex items-center justify-center gap-2 text-xs text-ink-400 sm:justify-start">
            <span>{likedTracks.length} songs</span>
            <span>· {formatTotalDuration(totalDuration)}</span>
          </div>
        </div>
      </header>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayAll}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-sonic-500 text-ink-950 shadow-lg transition-transform hover:scale-105"
          aria-label="Play"
        >
          <Play className="ml-1 h-6 w-6" fill="currentColor" />
        </button>
        <button
          onClick={handleShufflePlay}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-600 text-ink-200 transition-colors hover:border-ink-400 hover:text-white"
          aria-label="Shuffle"
        >
          <Shuffle className="h-5 w-5" />
        </button>
      </div>

      {/* Track list */}
      <div className="space-y-0.5">
        {likedTracks.map((track, i) => (
          <TrackRow
            key={track.id}
            track={track}
            index={i}
            queue={likedTracks}
            onRemove={() => {
              removeLiked(track.id);
              showToast('Removed from Liked Songs', 'default');
            }}
          />
        ))}
      </div>
    </div>
  );
}
