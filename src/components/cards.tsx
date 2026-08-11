import type { Track, Album, Artist, Playlist } from '@/types';
import { usePlayer } from '@/state/player';
import { useLibrary } from '@/state/library';
import { useRouter } from '@/state/router';
import { TrackLike } from '@/components/TrackLike';
import { openContextMenu, type ContextMenuItem } from '@/components/ContextMenu';
import { useToast } from '@/state/library';
import { Play, MoreHorizontal, Music2 } from 'lucide-react';
import { formatDuration, getFallbackImage } from '@/utils/helpers';

// ─── Track Card (for shelves) ──────────────────────────────────────

export function TrackCard({ track }: { track: Track }) {
  const { playTrack, isPlaying, currentTrack, togglePlay } = usePlayer();
  const isCurrent = currentTrack?.id === track.id;
  const showPlaying = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, [track]);
    }
  };

  return (
    <div className="group relative w-40 shrink-0 cursor-pointer rounded-lg p-2.5 transition-all hover:bg-ink-800/60 sm:w-44">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-ink-700">
        <img
          src={track.image || getFallbackImage(track.name)}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFallbackImage(track.name);
          }}
        />
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-sonic-500 text-ink-950 opacity-0 shadow-lg transition-all hover:scale-110 hover:bg-sonic-400 group-hover:translate-y-0 group-hover:opacity-100"
          aria-label={showPlaying ? 'Pause' : 'Play'}
        >
          {showPlaying ? (
            <EqualizerIcon />
          ) : (
            <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
          )}
        </button>
      </div>
      <div className="space-y-0.5">
        <div
          className={`truncate text-sm font-semibold ${
            isCurrent ? 'text-sonic-500' : 'text-white'
          }`}
        >
          {track.name}
        </div>
        <div className="truncate text-xs text-ink-400">{track.artist_name}</div>
      </div>
    </div>
  );
}

// ─── Album Card ────────────────────────────────────────────────────

export function AlbumCard({ album }: { album: Album }) {
  const { navigate } = useRouter();

  return (
    <div
      className="group w-40 shrink-0 cursor-pointer rounded-lg p-2.5 transition-all hover:bg-ink-800/60 sm:w-44"
      onClick={() => navigate(`/album/${album.id}`)}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-ink-700">
        <img
          src={album.image || getFallbackImage(album.name)}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFallbackImage(album.name);
          }}
        />
      </div>
      <div className="truncate text-sm font-semibold text-white">{album.name}</div>
      <div className="truncate text-xs text-ink-400">{album.artist_name}</div>
    </div>
  );
}

// ─── Artist Card ───────────────────────────────────────────────────

export function ArtistCard({ artist }: { artist: Artist }) {
  const { navigate } = useRouter();

  return (
    <div
      className="group w-40 shrink-0 cursor-pointer rounded-lg p-2.5 transition-all hover:bg-ink-800/60 sm:w-44"
      onClick={() => navigate(`/artist/${artist.id}`)}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-full bg-ink-700">
        <img
          src={artist.image || getFallbackImage(artist.name)}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFallbackImage(artist.name);
          }}
        />
      </div>
      <div className="truncate text-sm font-semibold text-white">{artist.name}</div>
      <div className="truncate text-xs text-ink-400">Artist</div>
    </div>
  );
}

// ─── Playlist Card ─────────────────────────────────────────────────

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const { navigate } = useRouter();

  return (
    <div
      className="group w-40 shrink-0 cursor-pointer rounded-lg p-2.5 transition-all hover:bg-ink-800/60 sm:w-44"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div
        className={`relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-md bg-gradient-to-br ${playlist.cover}`}
      >
        <Music2 className="h-12 w-12 text-white/70" />
      </div>
      <div className="truncate text-sm font-semibold text-white">{playlist.name}</div>
      <div className="truncate text-xs text-ink-400">{playlist.trackIds.length} songs</div>
    </div>
  );
}

// ─── Track Row (for lists) ─────────────────────────────────────────

interface TrackRowProps {
  track: Track;
  index?: number;
  queue?: Track[];
  showAlbum?: boolean;
  showArtwork?: boolean;
  onRemove?: () => void;
}

export function TrackRow({
  track,
  index,
  queue,
  showAlbum = true,
  showArtwork = true,
  onRemove,
}: TrackRowProps) {
  const { playTrack, isPlaying, currentTrack, togglePlay, addToQueue, addNext } = usePlayer();
  const { playlists, addToPlaylist, isLiked, toggleLike } = useLibrary();
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const isCurrent = currentTrack?.id === track.id;
  const showPlaying = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else if (queue) {
      const idx = queue.findIndex((t) => t.id === track.id);
      playTrack(track, queue, idx >= 0 ? idx : 0);
    } else {
      playTrack(track, [track]);
    }
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const items: ContextMenuItem[] = [
      {
        label: 'Play next',
        icon: <Play className="h-4 w-4" />,
        onClick: () => {
          addNext(track);
          showToast('Added to queue', 'success');
        },
      },
      {
        label: 'Add to queue',
        icon: <Play className="h-4 w-4" />,
        onClick: () => {
          addToQueue(track);
          showToast('Added to queue', 'success');
        },
      },
      {
        label: isLiked(track.id) ? 'Remove from Liked Songs' : 'Add to Liked Songs',
        icon: <Play className="h-4 w-4" />,
        onClick: () => {
          const liked = toggleLike(track);
          showToast(
            liked ? 'Added to Liked Songs' : 'Removed from Liked Songs',
            liked ? 'success' : 'default'
          );
        },
      },
      ...(playlists.length > 0
        ? playlists.map((pl) => ({
            label: `Add to "${pl.name}"`,
            onClick: () => {
              addToPlaylist(pl.id, track);
              showToast(`Added to "${pl.name}"`, 'success');
            },
          }))
        : []),
      {
        label: 'Go to artist',
        onClick: () => navigate(`/artist/${track.artist_id}`),
      },
      {
        label: 'Share',
        onClick: () => {
          if (track.shareurl) {
            shareTrack(track.shareurl, track.name, showToast);
          }
        },
      },
    ];

    if (onRemove) {
      items.push({
        label: 'Remove from playlist',
        variant: 'danger',
        onClick: onRemove,
      });
    }

    openContextMenu({ x: rect.left, y: rect.bottom + 4 }, items);
  };

  return (
    <div
      className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-ink-800/40"
      onDoubleClick={handlePlay}
    >
      {/* Index / Play button */}
      <div className="flex w-6 shrink-0 items-center justify-center">
        {showPlaying ? (
          <EqualizerIcon />
        ) : (
          <>
            <span className="text-sm tabular-nums text-ink-400 group-hover:hidden">
              {index !== undefined ? index + 1 : ''}
            </span>
            <button
              onClick={handlePlay}
              className="hidden text-white group-hover:block"
              aria-label="Play"
            >
              <Play className="h-4 w-4" fill="currentColor" />
            </button>
          </>
        )}
      </div>

      {/* Artwork + title + artist */}
      {showArtwork && (
        <img
          src={track.image || getFallbackImage(track.name)}
          alt=""
          className="h-10 w-10 shrink-0 rounded object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFallbackImage(track.name);
          }}
        />
      )}
      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-sm font-medium ${
            isCurrent ? 'text-sonic-500' : 'text-white'
          }`}
        >
          {track.name}
        </div>
        <button
          onClick={() => navigate(`/artist/${track.artist_id}`)}
          className="truncate text-xs text-ink-400 hover:text-white hover:underline"
        >
          {track.artist_name}
        </button>
      </div>

      {/* Album */}
      {showAlbum && (
        <div className="hidden min-w-0 flex-1 truncate text-sm text-ink-400 lg:block">
          {track.album_name}
        </div>
      )}

      {/* Like button */}
      <div className="flex shrink-0 items-center gap-1">
        <TrackLike track={track} />
        <span className="w-12 text-right text-xs tabular-nums text-ink-400">
          {formatDuration(track.duration)}
        </span>
        <button
          onClick={handleMore}
          className="rounded-full p-1.5 text-ink-400 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Equalizer icon (playing indicator) ────────────────────────────

export function EqualizerIcon() {
  return (
    <div className="flex h-5 items-end gap-0.5" aria-label="Now playing">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-0.5 rounded-full bg-sonic-500 animate-eq-bar"
          style={{
            height: '100%',
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.6 + i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Share helper ──────────────────────────────────────────────────

export function shareTrack(
  url: string,
  name: string,
  showToast: (msg: string, type?: 'default' | 'success' | 'error') => void
) {
  const shareData = {
    title: `SONIC — ${name}`,
    text: `Listen to "${name}" on SONIC`,
    url,
  };
  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard
      .writeText(url)
      .then(() => showToast('Link copied to clipboard', 'success'))
      .catch(() => showToast('Unable to copy link', 'error'));
  } else {
    showToast('Sharing not available', 'error');
  }
}
