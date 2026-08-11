import { useEffect, useState, useCallback } from 'react';
import { jamendo } from '@/services/jamendo';
import { usePlayer } from '@/state/player';
import { useLibrary } from '@/state/library';
import { useRouter } from '@/state/router';
import { Shelf } from '@/components/Shelf';
import { TrackCard, ArtistCard, PlaylistCard } from '@/components/cards';
import { ShelfSkeleton } from '@/components/LoadingSkeleton';
import { getGreeting } from '@/utils/helpers';
import { GENRES } from '@/config';
import type { Track, Artist } from '@/types';
import { Link } from '@/components/Link';
import { Heart, Play, Clock, Music2, ChevronRight } from 'lucide-react';

export function HomePage() {
  const { playQueue, toggleShuffle, isShuffled } = usePlayer();
  const { likedTracks, recentlyPlayed, followedArtists, playlists } = useLibrary();
  const { navigate } = useRouter();

  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
  const [genreTracks, setGenreTracks] = useState<Record<string, Track[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [pop, recent, artists] = await Promise.all([
        jamendo.getPopularTracks(10),
        jamendo.getRecentTracks(10),
        jamendo.getPopularArtists(10),
      ]);
      setPopularTracks(pop);
      setRecentTracks(recent);
      setPopularArtists(artists);

      // Fetch a few genre shelves
      const genrePromises = GENRES.slice(0, 4).map(async (g) => {
        const tracks = await jamendo.getTracksByTag([...g.tags], 10);
        return { genre: g.name, tracks };
      });
      const genreResults = await Promise.all(genrePromises);
      const genreMap: Record<string, Track[]> = {};
      genreResults.forEach((r) => {
        genreMap[r.genre] = r.tracks;
      });
      setGenreTracks(genreMap);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePlayLiked = () => {
    if (likedTracks.length > 0) {
      playQueue(likedTracks);
    }
  };

  const handleShuffleLiked = () => {
    if (!isShuffled) toggleShuffle();
    playQueue(likedTracks);
  };

  const greeting = getGreeting();

  if (error && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Music2 className="mb-4 h-12 w-12 text-ink-400" />
        <p className="mb-2 text-lg font-semibold text-white">Music couldn't be loaded right now.</p>
        <p className="mb-4 text-sm text-ink-400">Check your connection and try again.</p>
        <button
          onClick={fetchData}
          className="rounded-full bg-sonic-500 px-6 py-2.5 text-sm font-bold text-ink-950 transition-colors hover:bg-sonic-400"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      {/* Greeting + Hero */}
      <header className="space-y-4">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{greeting}</h1>

        {/* Quick access cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Liked Songs card */}
          <Link
            to="/liked"
            className="group relative flex items-center gap-4 overflow-hidden rounded-lg bg-gradient-to-br from-sonic-600/20 to-sonic-900/40 p-4 transition-all hover:from-sonic-600/30 hover:to-sonic-900/50"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-sonic-500 to-sonic-700 shadow-lg">
              <Heart className="h-7 w-7 fill-white text-white" strokeWidth={0} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-bold text-white">Liked Songs</div>
              <div className="truncate text-sm text-ink-300">
                {likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}
              </div>
            </div>
            {likedTracks.length > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handlePlayLiked();
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sonic-500 text-ink-950 opacity-0 shadow-lg transition-all hover:scale-105 group-hover:opacity-100"
                aria-label="Play liked songs"
              >
                <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
              </button>
            )}
          </Link>

          {/* Recently Played card */}
          <Link
            to="/library"
            className="group relative flex items-center gap-4 overflow-hidden rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-900/30 p-4 transition-all hover:from-blue-600/30 hover:to-blue-900/40"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-bold text-white">Recently Played</div>
              <div className="truncate text-sm text-ink-300">
                {recentlyPlayed.length} {recentlyPlayed.length === 1 ? 'song' : 'songs'}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-ink-400 group-hover:text-white" />
          </Link>

          {/* Create Playlist card */}
          <Link
            to="/create"
            className="group relative flex items-center gap-4 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-600/20 to-emerald-900/30 p-4 transition-all hover:from-emerald-600/30 hover:to-emerald-900/40"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg">
              <Music2 className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-bold text-white">Create Playlist</div>
              <div className="truncate text-sm text-ink-300">Start your collection</div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-ink-400 group-hover:text-white" />
          </Link>
        </div>
      </header>

      {/* Recently Played shelf */}
      {recentlyPlayed.length > 0 && (
        <Shelf title="Recently Played" onSeeAll={() => navigate('/library')}>
          {recentlyPlayed.slice(0, 10).map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </Shelf>
      )}

      {/* Loading skeletons */}
      {loading && (
        <>
          <ShelfSkeleton />
          <ShelfSkeleton />
          <ShelfSkeleton />
        </>
      )}

      {/* Popular Right Now */}
      {!loading && popularTracks.length > 0 && (
        <Shelf title="Popular Right Now">
          {popularTracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </Shelf>
      )}

      {/* New Discoveries */}
      {!loading && recentTracks.length > 0 && (
        <Shelf title="New Discoveries">
          {recentTracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </Shelf>
      )}

      {/* Made For You — based on liked genres */}
      {!loading && likedTracks.length > 0 && (
        <MadeForYou likedTracks={likedTracks} recentlyPlayed={recentlyPlayed} />
      )}

      {/* Genre shelves */}
      {!loading &&
        Object.entries(genreTracks).map(([genreName, tracks]) =>
          tracks.length > 0 ? (
            <Shelf key={genreName} title={genreName}>
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </Shelf>
          ) : null
        )}

      {/* Artists You Follow */}
      {followedArtists.length > 0 && (
        <Shelf title="Artists You Follow">
          {followedArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </Shelf>
      )}

      {/* Popular Artists */}
      {!loading && popularArtists.length > 0 && (
        <Shelf title="Popular Artists">
          {popularArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </Shelf>
      )}

      {/* Your Playlists */}
      {playlists.length > 0 && (
        <Shelf title="Your Playlists" onSeeAll={() => navigate('/library')}>
          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </Shelf>
      )}

      {/* Browse Genres */}
      {!loading && (
        <section>
          <h2 className="mb-3 px-1 text-lg font-bold text-white sm:text-xl">Browse Genres</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {GENRES.map((genre) => (
              <button
                key={genre.name}
                onClick={() => navigate(`/search/${genre.name}`)}
                className={`group relative flex h-24 items-end overflow-hidden rounded-lg bg-gradient-to-br ${genre.color} p-3 transition-transform hover:scale-[1.02] sm:h-28`}
              >
                <span className="text-lg font-bold text-white drop-shadow-lg">{genre.name}</span>
                <Music2 className="absolute -right-2 -top-2 h-16 w-16 rotate-12 text-white/20" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Made For You component ─────────────────────────────────────────

function MadeForYou({
  likedTracks,
  recentlyPlayed,
}: {
  likedTracks: Track[];
  recentlyPlayed: Track[];
}) {
  const { playQueue } = usePlayer();
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      // Heuristic: gather genres from liked + recently played tracks
      const allTracks = [...likedTracks, ...recentlyPlayed];
      const genreCount: Record<string, number> = {};

      allTracks.forEach((t) => {
        const genres = t.musicinfo?.tags?.genres || [];
        genres.forEach((g) => {
          genreCount[g] = (genreCount[g] || 0) + 1;
        });
      });

      const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([g]) => g);

      if (topGenres.length === 0) {
        // Fallback: use popular tracks
        const pop = await jamendo.getPopularTracks(10);
        setRecommendations(pop);
      } else {
        const tracks = await jamendo.getTracksByTag(topGenres, 10);
        // Filter out tracks the user already knows
        const knownIds = new Set(allTracks.map((t) => t.id));
        const fresh = tracks.filter((t) => !knownIds.has(t.id));
        setRecommendations(fresh.length >= 5 ? fresh : tracks);
      }
      setLoading(false);
    };
    fetchRecs();
  }, [likedTracks, recentlyPlayed]);

  if (loading || recommendations.length === 0) return null;

  return (
    <Shelf
      title="Made For You"
      onSeeAll={() => {
        playQueue(recommendations);
      }}
    >
      {recommendations.map((track) => (
        <TrackCard key={track.id} track={track} />
      ))}
    </Shelf>
  );
}
