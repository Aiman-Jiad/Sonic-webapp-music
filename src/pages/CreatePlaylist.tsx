import { useState, useEffect, useCallback } from 'react';
import { useLibrary } from '@/state/library';
import { useToast } from '@/state/library';
import { usePlayer } from '@/state/player';
import { useRouter } from '@/state/router';
import { TrackRow } from '@/components/cards';
import { SearchBar } from '@/components/SearchBar';
import { RowSkeleton } from '@/components/LoadingSkeleton';
import { jamendo } from '@/services/jamendo';
import type { Track, Playlist } from '@/types';
import { getPlaylistCoverColor, formatDate } from '@/utils/helpers';
import {
  Play,
  Shuffle,
  Music2,
  Plus,
  Check,
} from 'lucide-react';

interface CreatePlaylistPageProps {
  editPlaylistId?: string;
}

export function CreatePlaylistPage({ editPlaylistId }: CreatePlaylistPageProps) {
  const { createPlaylist, renamePlaylist, addToPlaylist, removeFromPlaylist, getPlaylist } =
    useLibrary();
  const { showToast } = useToast();
  const { playQueue, toggleShuffle } = usePlayer();
  const { navigate } = useRouter();

  const editingPlaylist = editPlaylistId ? getPlaylist(editPlaylistId) : undefined;

  const [name, setName] = useState(editingPlaylist?.name ?? '');
  const [description, setDescription] = useState(editingPlaylist?.description ?? '');
  const [created, setCreated] = useState<Playlist | null>(editingPlaylist ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);

  // If editing, load playlist tracks from Jamendo
  useEffect(() => {
    if (editingPlaylist) {
      const fetchTracks = async () => {
        const resolved = await jamendo.getTracksByIds(editingPlaylist.trackIds);
        setPlaylistTracks(resolved);
      };
      fetchTracks();
      setCreated(editingPlaylist);
    }
  }, [editingPlaylist]);

  // Search for tracks to add
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await jamendo.searchTracks(searchQuery, 15);
      setSearchResults(results);
      setSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateOrUpdate = useCallback(() => {
    if (!name.trim()) {
      showToast('Please enter a playlist name', 'error');
      return;
    }
    if (created) {
      renamePlaylist(created.id, name.trim(), description.trim());
      showToast('Playlist updated', 'success');
    } else {
      const pl = createPlaylist(name.trim(), description.trim());
      setCreated(pl);
      showToast('Playlist created', 'success');
    }
  }, [name, description, created, createPlaylist, renamePlaylist, showToast]);

  const handleAddTrack = (track: Track) => {
    if (!created) {
      // Create the playlist first, then add
      const pl = createPlaylist(name.trim() || 'New Playlist', description.trim());
      setCreated(pl);
      addToPlaylist(pl.id, track);
      setPlaylistTracks((t) => [...t, track]);
      showToast(`Added "${track.name}"`, 'success');
    } else {
      addToPlaylist(created.id, track);
      setPlaylistTracks((t) => [...t, track]);
      showToast(`Added "${track.name}"`, 'success');
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    if (!created) return;
    removeFromPlaylist(created.id, trackId);
    setPlaylistTracks((prev) => prev.filter((tr) => tr.id !== trackId));
    showToast('Removed from playlist', 'default');
  };

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      playQueue(playlistTracks);
    }
  };

  const handleShufflePlay = () => {
    if (playlistTracks.length > 0) {
      toggleShuffle();
      playQueue(playlistTracks);
    }
  };

  const isTrackInPlaylist = (trackId: string) =>
    created?.trackIds.includes(trackId) || playlistTracks.some((t) => t.id === trackId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <div
          className={`flex h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${
            created?.cover ?? getPlaylistCoverColor(name || 'New Playlist')
          } shadow-2xl sm:h-48 sm:w-48`}
        >
          <Music2 className="h-16 w-16 text-white/70" />
        </div>
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">Playlist</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Playlist"
            className="w-full bg-transparent text-2xl font-extrabold text-white placeholder-ink-500 focus:outline-none sm:text-4xl"
            maxLength={50}
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="w-full bg-transparent text-sm text-ink-300 placeholder-ink-500 focus:outline-none"
            maxLength={100}
          />
          <div className="flex items-center justify-center gap-2 text-xs text-ink-400 sm:justify-start">
            <span>{playlistTracks.length} songs</span>
            {created && <span>· Created {formatDate(created.createdAt)}</span>}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCreateOrUpdate}
          className="rounded-full bg-sonic-500 px-6 py-2.5 text-sm font-bold text-ink-950 transition-colors hover:bg-sonic-400"
        >
          {created && editPlaylistId ? 'Save' : 'Create'}
        </button>
        {playlistTracks.length > 0 && (
          <>
            <button
              onClick={handlePlayAll}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-950 transition-transform hover:scale-105"
              aria-label="Play"
            >
              <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
            </button>
            <button
              onClick={handleShufflePlay}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-600 text-ink-200 transition-colors hover:border-ink-400 hover:text-white"
              aria-label="Shuffle play"
            >
              <Shuffle className="h-5 w-5" />
            </button>
          </>
        )}
        {created && (
          <button
            onClick={() => navigate(`/playlist/${created.id}`)}
            className="ml-auto text-sm font-semibold text-ink-300 hover:text-white"
          >
            View playlist →
          </button>
        )}
      </div>

      {/* Search to add tracks */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">Add Songs</h3>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search for songs to add..."
        />

        {/* Search results */}
        {searchQuery.trim() && (
          <div className="space-y-0.5">
            {searching ? (
              <RowSkeleton count={4} />
            ) : searchResults.length === 0 ? (
              <div className="py-6 text-center text-sm text-ink-400">
                No songs found. Try a different search.
              </div>
            ) : (
              searchResults.map((track, i) => (
                <div
                  key={track.id}
                  className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-ink-800/40"
                >
                  <TrackRow
                    track={track}
                    index={i}
                    showAlbum={false}
                    queue={searchResults}
                  />
                  <button
                    onClick={() => handleAddTrack(track)}
                    disabled={isTrackInPlaylist(track.id)}
                    className={`shrink-0 rounded-full p-2 transition-colors ${
                      isTrackInPlaylist(track.id)
                        ? 'text-sonic-500'
                        : 'text-ink-300 hover:bg-ink-700 hover:text-white'
                    }`}
                    aria-label={isTrackInPlaylist(track.id) ? 'Already added' : 'Add to playlist'}
                  >
                    {isTrackInPlaylist(track.id) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Playlist tracks */}
      {playlistTracks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">In This Playlist</h3>
          {playlistTracks.map((track, i) => (
            <div key={track.id} className="group relative">
              <TrackRow
                track={track}
                index={i}
                queue={playlistTracks}
                showAlbum={false}
                onRemove={() => handleRemoveTrack(track.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
