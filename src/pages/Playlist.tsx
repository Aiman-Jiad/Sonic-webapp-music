import { useEffect, useState } from 'react';
import { jamendo } from '@/services/jamendo';
import { usePlayer } from '@/state/player';
import { useLibrary } from '@/state/library';
import { useToast } from '@/state/library';
import { useRouter } from '@/state/router';
import { TrackRow } from '@/components/cards';
import { RowSkeleton } from '@/components/LoadingSkeleton';
import { openContextMenu } from '@/components/ContextMenu';
import { formatTotalDuration, formatDate } from '@/utils/helpers';
import type { Track } from '@/types';
import {
  Play,
  Shuffle,
  Music2,
  Pencil,
  Trash2,
  Share2,
  Clock,
  MoreHorizontal,
} from 'lucide-react';

interface PlaylistPageProps {
  playlistId: string;
}

export function PlaylistPage({ playlistId }: PlaylistPageProps) {
  const { playQueue, toggleShuffle, isShuffled } = usePlayer();
  const { getPlaylist, deletePlaylist, removeFromPlaylist } = useLibrary();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const playlist = getPlaylist(playlistId);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  // Load playlist tracks from Jamendo by IDs
  useEffect(() => {
    if (!playlist) {
      setLoading(false);
      return;
    }
    const fetchTracks = async () => {
      setLoading(true);
      const resolved = await jamendo.getTracksByIds(playlist.trackIds);
      setTracks(resolved);
      setLoading(false);
    };
    fetchTracks();
  }, [playlist]);

  const handlePlayAll = () => {
    if (tracks.length > 0) playQueue(tracks);
  };

  const handleShufflePlay = () => {
    if (!isShuffled) toggleShuffle();
    if (tracks.length > 0) playQueue(tracks);
  };

  const handleDelete = () => {
    if (!playlist) return;
    if (confirm(`Delete playlist "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      showToast('Playlist deleted', 'default');
      navigate('/library');
    }
  };

  const handleEdit = () => {
    if (playlist) navigate(`/create/${playlist.id}`);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `SONIC — ${playlist?.name}`, text: `Listen to "${playlist?.name}" on SONIC`, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard', 'success'));
    }
  };

  const handlePlaylistMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    openContextMenu({ x: rect.left, y: rect.bottom + 4 }, [
      { label: 'Edit details', icon: <Pencil className="h-4 w-4" />, onClick: handleEdit },
      { label: 'Share', icon: <Share2 className="h-4 w-4" />, onClick: handleShare },
      { label: 'Delete playlist', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: handleDelete },
    ]);
  };

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Music2 className="mb-4 h-12 w-12 text-ink-400" />
        <p className="mb-4 text-lg font-semibold text-white">Playlist not found</p>
        <button
          onClick={() => navigate('/library')}
          className="rounded-full bg-sonic-500 px-6 py-2.5 text-sm font-bold text-ink-950 hover:bg-sonic-400"
        >
          Go to Library
        </button>
      </div>
    );
  }

  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <div
          className={`flex h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${playlist.cover} shadow-2xl sm:h-48 sm:w-48`}
        >
          <Music2 className="h-16 w-16 text-white/70" />
        </div>
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">Playlist</div>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-sm text-ink-300">{playlist.description}</p>
          )}
          <div className="flex items-center justify-center gap-2 text-xs text-ink-400 sm:justify-start">
            <span>{tracks.length} songs</span>
            {totalDuration > 0 && <span>· {formatTotalDuration(totalDuration)}</span>}
            <span>· Created {formatDate(playlist.createdAt)}</span>
          </div>
        </div>
        <button
          onClick={handlePlaylistMenu}
          className="rounded-full p-2.5 text-ink-300 transition-colors hover:bg-ink-800 hover:text-white"
          aria-label="More options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      {/* Action buttons */}
      {tracks.length > 0 && (
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
      )}

      {/* Tracks */}
      {loading ? (
        <RowSkeleton count={5} />
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Music2 className="mb-3 h-10 w-10 text-ink-400" />
          <p className="mb-1 text-lg font-semibold text-white">This playlist is empty</p>
          <p className="mb-4 text-sm text-ink-400">Search for songs and add them to this playlist.</p>
          <button
            onClick={handleEdit}
            className="rounded-full bg-sonic-500 px-5 py-2 text-sm font-bold text-ink-950 hover:bg-sonic-400"
          >
            Add Songs
          </button>
        </div>
      ) : (
        <div className="space-y-0.5">
          {tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              queue={tracks}
              onRemove={() => {
                removeFromPlaylist(playlist.id, track.id);
                setTracks((prev) => prev.filter((tr) => tr.id !== track.id));
                showToast('Removed from playlist', 'default');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
