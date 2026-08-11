import { useEffect, useState, useCallback } from 'react';
import { jamendo } from '@/services/jamendo';
import { usePlayer } from '@/state/player';
import { useToast } from '@/state/library';
import { useRouter } from '@/state/router';
import { SearchBar } from '@/components/SearchBar';
import { TrackRow, ArtistCard, AlbumCard } from '@/components/cards';
import { RowSkeleton, LoadingSkeleton } from '@/components/LoadingSkeleton';
import { storage } from '@/storage/localStorage';
import { TRENDING_SEARCHES, GENRES } from '@/config';
import type { Track, Album, Artist } from '@/types';
import { Search as SearchIcon, TrendingUp, Clock, X, Music2 } from 'lucide-react';

export function SearchPage() {
  const { navigate, path } = useRouter();
  const initialQuery = path.startsWith('/search/') ? decodeURIComponent(path.slice(8)) : '';
  const [query, setQuery] = useState(initialQuery);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [searchHistory, setSearchHistory] = useState(() => storage.getSearchHistory());

  const { playQueue } = usePlayer();
  const { showToast } = useToast();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setTracks([]);
      setArtists([]);
      setAlbums([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);

    // Save to search history
    const history = storage.getSearchHistory();
    const existing = history.findIndex((h) => h.query.toLowerCase() === q.trim().toLowerCase());
    if (existing >= 0) history.splice(existing, 1);
    history.unshift({ query: q.trim(), searchedAt: Date.now() });
    storage.setSearchHistory(history.slice(0, 10));
    setSearchHistory(history.slice(0, 10));

    try {
      const [t, a, al] = await Promise.all([
        jamendo.searchTracks(q, 20),
        jamendo.searchArtists(q, 6),
        jamendo.searchAlbums(q, 6),
      ]);
      setTracks(t);
      setArtists(a);
      setAlbums(al);
    } catch {
      showToast('Search failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Update URL when query changes
  useEffect(() => {
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
    } else if (path.startsWith('/search/')) {
      navigate('/search');
    }
  }, [query, navigate, path]);

  // Initial search if loaded with a query
  useEffect(() => {
    if (initialQuery) {
      search(initialQuery);
    }
  }, []);

  const handleHistoryClick = (q: string) => {
    setQuery(q);
    search(q);
  };

  const clearHistory = () => {
    storage.setSearchHistory([]);
    setSearchHistory([]);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Search header */}
      <div className="sticky top-0 z-10 -mx-4 bg-gradient-to-b from-ink-900 to-ink-900/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <h1 className="mb-3 text-2xl font-extrabold text-white">Search</h1>
        <SearchBar value={query} onChange={search} autoFocus={!initialQuery} />
      </div>

      {/* No search yet — show discovery */}
      {!hasSearched && (
        <div className="space-y-8">
          {/* Recent searches */}
          {searchHistory.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Clock className="h-5 w-5 text-ink-400" /> Recent Searches
                </h2>
                <button
                  onClick={clearHistory}
                  className="text-xs font-semibold uppercase tracking-wider text-ink-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((h) => (
                  <button
                    key={h.query + h.searchedAt}
                    onClick={() => handleHistoryClick(h.query)}
                    className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-800 px-3 py-1.5 text-sm text-ink-200 transition-colors hover:border-ink-600 hover:bg-ink-700 hover:text-white"
                  >
                    {h.query}
                    <X
                      className="h-3 w-3 text-ink-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        const filtered = searchHistory.filter((s) => s.query !== h.query);
                        storage.setSearchHistory(filtered);
                        setSearchHistory(filtered);
                      }}
                    />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Trending searches */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
              <TrendingUp className="h-5 w-5 text-sonic-500" /> Trending Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleHistoryClick(term)}
                  className="rounded-full border border-ink-700 bg-ink-800 px-4 py-1.5 text-sm text-ink-200 transition-colors hover:border-sonic-500/50 hover:bg-ink-700 hover:text-white"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          {/* Browse genres */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-white">Browse Genres</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {GENRES.map((genre) => (
                <button
                  key={genre.name}
                  onClick={() => handleHistoryClick(genre.name)}
                  className={`group relative flex h-24 items-end overflow-hidden rounded-lg bg-gradient-to-br ${genre.color} p-3 transition-transform hover:scale-[1.02] sm:h-28`}
                >
                  <span className="text-lg font-bold text-white drop-shadow-lg">{genre.name}</span>
                  <Music2 className="absolute -right-2 -top-2 h-16 w-16 rotate-12 text-white/20" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Search results */}
      {hasSearched && (
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              <div>
                <div className="mb-3 h-6 w-32 skeleton rounded" />
                <LoadingSkeleton count={4} />
              </div>
              <div>
                <div className="mb-3 h-6 w-32 skeleton rounded" />
                <RowSkeleton count={4} />
              </div>
            </div>
          ) : tracks.length === 0 && artists.length === 0 && albums.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <SearchIcon className="mb-4 h-12 w-12 text-ink-500" />
              <p className="text-lg font-semibold text-white">No results for "{query}"</p>
              <p className="mt-1 text-sm text-ink-400">
                Try a different keyword or check your spelling.
              </p>
            </div>
          ) : (
            <>
              {/* Artists */}
              {artists.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-bold text-white">Artists</h2>
                  <div className="no-scrollbar flex gap-1 overflow-x-auto pb-2">
                    {artists.map((artist) => (
                      <ArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>
                </section>
              )}

              {/* Albums */}
              {albums.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-bold text-white">Albums</h2>
                  <div className="no-scrollbar flex gap-1 overflow-x-auto pb-2">
                    {albums.map((album) => (
                      <AlbumCard key={album.id} album={album} />
                    ))}
                  </div>
                </section>
              )}

              {/* Tracks */}
              {tracks.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Songs</h2>
                    <button
                      onClick={() => playQueue(tracks)}
                      className="text-xs font-semibold uppercase tracking-wider text-sonic-500 hover:text-sonic-400"
                    >
                      Play all
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {tracks.map((track, i) => (
                      <TrackRow key={track.id} track={track} index={i} queue={tracks} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
