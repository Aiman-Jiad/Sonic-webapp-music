import { useState } from 'react';
import { useLibrary } from '@/state/library';
import { usePlayer } from '@/state/player';
import { useRouter } from '@/state/router';
import { TrackRow, PlaylistCard, ArtistCard } from '@/components/cards';
import { Link } from '@/components/Link';
import { Heart, Clock, Plus, Music2, Library as LibraryIcon } from 'lucide-react';

type Filter = 'all' | 'playlists' | 'artists' | 'recently-played';

export function LibraryPage() {
  const {
    likedTracks,
    playlists,
    followedArtists,
    recentlyPlayed,
  } = useLibrary();
  const { playQueue } = usePlayer();
  const { navigate } = useRouter();
  const [filter, setFilter] = useState<Filter>('all');

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'playlists', label: 'Playlists' },
    { key: 'artists', label: 'Artists' },
    { key: 'recently-played', label: 'Recently Played' },
  ];

  const isEmpty =
    likedTracks.length === 0 &&
    playlists.length === 0 &&
    followedArtists.length === 0 &&
    recentlyPlayed.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-ink-800">
          <LibraryIcon className="h-10 w-10 text-ink-400" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">Your library is waiting</h2>
        <p className="mb-6 max-w-sm text-sm text-ink-400">
          Start listening and your liked songs, playlists, and followed artists will appear here.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="rounded-full bg-sonic-500 px-6 py-2.5 text-sm font-bold text-ink-950 transition-colors hover:bg-sonic-400"
        >
          Browse Music
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Your Library</h1>

      {/* Filter chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.key
                ? 'bg-white text-ink-950'
                : 'bg-ink-800 text-ink-200 hover:bg-ink-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liked Songs card — always visible at top in "all" and "playlists" */}
      {(filter === 'all' || filter === 'playlists') && (
        <Link
          to="/liked"
          className="group flex items-center gap-4 rounded-lg bg-ink-800/50 p-3 transition-colors hover:bg-ink-800"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-sonic-500 to-sonic-700 shadow-lg">
            <Heart className="h-7 w-7 fill-white text-white" strokeWidth={0} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-bold text-white">Liked Songs</div>
            <div className="truncate text-sm text-ink-400">
              {likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}
            </div>
          </div>
        </Link>
      )}

      {/* Playlists */}
      {(filter === 'all' || filter === 'playlists') && playlists.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Playlists</h2>
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-sonic-500 hover:text-sonic-400"
            >
              <Plus className="h-4 w-4" /> New
            </button>
          </div>
          <div className="no-scrollbar flex gap-1 overflow-x-auto pb-2">
            {playlists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        </section>
      )}

      {/* Followed Artists */}
      {(filter === 'all' || filter === 'artists') && followedArtists.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-white">Followed Artists</h2>
          <div className="no-scrollbar flex gap-1 overflow-x-auto pb-2">
            {followedArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Played */}
      {(filter === 'all' || filter === 'recently-played') && recentlyPlayed.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Clock className="h-5 w-5 text-ink-400" /> Recently Played
            </h2>
            {recentlyPlayed.length > 1 && (
              <button
                onClick={() => playQueue(recentlyPlayed)}
                className="text-xs font-semibold uppercase tracking-wider text-sonic-500 hover:text-sonic-400"
              >
                Play all
              </button>
            )}
          </div>
          <div className="space-y-0.5">
            {recentlyPlayed.slice(0, 20).map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                index={i}
                queue={recentlyPlayed}
                showAlbum={false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
