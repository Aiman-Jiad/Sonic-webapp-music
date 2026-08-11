import { useEffect, useState, useCallback } from 'react';
import { jamendo } from '@/services/jamendo';
import { usePlayer } from '@/state/player';
import { useRouter } from '@/state/router';
import { TrackRow } from '@/components/cards';
import { RowSkeleton } from '@/components/LoadingSkeleton';
import { getFallbackImage, formatTotalDuration } from '@/utils/helpers';
import type { Track, Album } from '@/types';
import { Play, Shuffle, Music2, Disc3, ChevronLeft } from 'lucide-react';

interface AlbumPageProps {
  albumId: string;
}

export function AlbumPage({ albumId }: AlbumPageProps) {
  const { playQueue, toggleShuffle, isShuffled } = usePlayer();
  const { navigate } = useRouter();

  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [al, t] = await Promise.all([
        jamendo.getAlbum(albumId),
        jamendo.getAlbumTracks(albumId),
      ]);
      setAlbum(al);
      setTracks(t);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePlayAll = () => {
    if (tracks.length > 0) playQueue(tracks);
  };

  const handleShufflePlay = () => {
    if (!isShuffled) toggleShuffle();
    if (tracks.length > 0) playQueue(tracks);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-end gap-4">
          <div className="h-40 w-40 rounded skeleton sm:h-48 sm:w-48" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-20 skeleton rounded" />
            <div className="h-10 w-48 skeleton rounded" />
            <div className="h-4 w-32 skeleton rounded" />
          </div>
        </div>
        <RowSkeleton count={5} />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Disc3 className="mb-4 h-12 w-12 text-ink-400" />
        <p className="mb-4 text-lg font-semibold text-white">Album not found</p>
        <button
          onClick={() => navigate('/search')}
          className="rounded-full bg-sonic-500 px-6 py-2.5 text-sm font-bold text-ink-950 hover:bg-sonic-400"
        >
          Browse Music
        </button>
      </div>
    );
  }

  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1 text-sm text-ink-300 hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <img
          src={album.image || getFallbackImage(album.name)}
          alt={album.name}
          className="h-40 w-40 shrink-0 rounded-lg object-cover shadow-2xl sm:h-48 sm:w-48"
          onError={(e) => { (e.target as HTMLImageElement).src = getFallbackImage(album.name); }}
        />
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">Album</div>
          <h1 className="text-2xl font-extrabold text-white sm:text-4xl">{album.name}</h1>
          <button
            onClick={() => navigate(`/artist/${album.artist_id}`)}
            className="text-sm text-ink-300 hover:text-white hover:underline"
          >
            {album.artist_name}
          </button>
          <div className="flex items-center justify-center gap-2 text-xs text-ink-400 sm:justify-start">
            <span>{tracks.length} songs</span>
            {totalDuration > 0 && <span>· {formatTotalDuration(totalDuration)}</span>}
            {album.releasedate && <span>· {album.releasedate.slice(0, 4)}</span>}
          </div>
        </div>
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

      {/* Track list */}
      {tracks.length === 0 ? (
        <div className="py-12 text-center text-ink-400">
          <Music2 className="mx-auto mb-3 h-10 w-10" />
          No tracks available in this album.
        </div>
      ) : (
        <div className="space-y-0.5">
          {tracks.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} queue={tracks} showAlbum={false} />
          ))}
        </div>
      )}
    </div>
  );
}
