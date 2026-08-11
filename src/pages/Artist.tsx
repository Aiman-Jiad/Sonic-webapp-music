import { useEffect, useState, useCallback } from 'react';
import { jamendo } from '@/services/jamendo';
import { usePlayer } from '@/state/player';
import { useLibrary } from '@/state/library';
import { useToast } from '@/state/library';
import { useRouter } from '@/state/router';
import { TrackRow, AlbumCard } from '@/components/cards';
import { RowSkeleton } from '@/components/LoadingSkeleton';
import { openContextMenu } from '@/components/ContextMenu';
import { getFallbackImage } from '@/utils/helpers';
import type { Track, Artist, Album } from '@/types';
import {
  Play,
  Shuffle,
  UserPlus,
  UserCheck,
  MoreHorizontal,
  Share2,
  Music2,
  Disc3,
} from 'lucide-react';

interface ArtistPageProps {
  artistId: string;
}

export function ArtistPage({ artistId }: ArtistPageProps) {
  const { playQueue, toggleShuffle, isShuffled, addNext, addToQueue } = usePlayer();
  const { isFollowing, toggleFollow, isLiked, toggleLike, playlists, addToPlaylist } = useLibrary();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [a, t, al] = await Promise.all([
        jamendo.getArtist(artistId),
        jamendo.getTracksByArtist(artistId, 10),
        jamendo.getArtistAlbums(artistId, 10),
      ]);
      setArtist(a);
      setTracks(t);
      setAlbums(al);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const following = artist ? isFollowing(artist.id) : false;

  const handleFollow = () => {
    if (!artist) return;
    const nowFollowing = toggleFollow(artist);
    showToast(
      nowFollowing ? `Following ${artist.name}` : `Unfollowed ${artist.name}`,
      nowFollowing ? 'success' : 'default'
    );
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) playQueue(tracks);
  };

  const handleShufflePlay = () => {
    if (!isShuffled) toggleShuffle();
    if (tracks.length > 0) playQueue(tracks);
  };

  const handleShare = () => {
    if (!artist) return;
    const url = artist.shareurl || artist.shorturl || window.location.href;
    if (navigator.share) {
      navigator.share({ title: `SONIC — ${artist.name}`, text: `Listen to ${artist.name} on SONIC`, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showToast('Link copied', 'success'));
    }
  };

  const handleTrackMore = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const items = [
      { label: 'Play next', onClick: () => { addNext(track); showToast('Added to queue', 'success'); } },
      { label: 'Add to queue', onClick: () => { addToQueue(track); showToast('Added to queue', 'success'); } },
      {
        label: isLiked(track.id) ? 'Remove from Liked Songs' : 'Add to Liked Songs',
        onClick: () => {
          const liked = toggleLike(track);
          showToast(liked ? 'Added to Liked Songs' : 'Removed from Liked Songs', liked ? 'success' : 'default');
        },
      },
      ...playlists.map((pl) => ({
        label: `Add to "${pl.name}"`,
        onClick: () => { addToPlaylist(pl.id, track); showToast(`Added to "${pl.name}"`, 'success'); },
      })),
      { label: 'Share', onClick: () => {
        const url = track.shareurl || track.shorturl || window.location.href;
        if (navigator.share) navigator.share({ title: track.name, url }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => showToast('Link copied', 'success'));
      }},
    ];
    openContextMenu({ x: rect.left, y: rect.bottom + 4 }, items);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-end gap-4">
          <div className="h-40 w-40 rounded-full skeleton sm:h-48 sm:w-48" />
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

  if (error || !artist) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Music2 className="mb-4 h-12 w-12 text-ink-400" />
        <p className="mb-4 text-lg font-semibold text-white">Artist not found</p>
        <button
          onClick={() => navigate('/search')}
          className="rounded-full bg-sonic-500 px-6 py-2.5 text-sm font-bold text-ink-950 hover:bg-sonic-400"
        >
          Search for artists
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      {/* Hero header */}
      <header
        className="relative -mx-4 flex flex-col items-center justify-end gap-4 px-4 pt-12 pb-6 sm:-mx-6 sm:px-6 sm:pt-20"
        style={{
          background: `linear-gradient(to bottom, rgba(245,130,13,0.15), rgba(10,10,11,0.8)), url(${artist.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      >
        <div className="absolute inset-0 -mx-4 bg-gradient-to-b from-transparent via-ink-950/40 to-ink-950 sm:-mx-6" />
        <div className="relative flex flex-col items-center gap-3 text-center">
          <img
            src={artist.image || getFallbackImage(artist.name)}
            alt={artist.name}
            className="h-32 w-32 rounded-full border-4 border-white/10 object-cover shadow-2xl sm:h-40 sm:w-40"
            onError={(e) => { (e.target as HTMLImageElement).src = getFallbackImage(artist.name); }}
          />
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-300">Artist</div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg sm:text-5xl">{artist.name}</h1>
        </div>
      </header>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {tracks.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-sonic-500 text-ink-950 shadow-lg transition-transform hover:scale-105"
            aria-label="Play"
          >
            <Play className="ml-1 h-6 w-6" fill="currentColor" />
          </button>
        )}
        {tracks.length > 0 && (
          <button
            onClick={handleShufflePlay}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-600 text-ink-200 transition-colors hover:border-ink-400 hover:text-white"
            aria-label="Shuffle"
          >
            <Shuffle className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={handleFollow}
          className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
            following
              ? 'border border-ink-600 bg-transparent text-ink-200 hover:border-ink-400'
              : 'bg-white text-ink-950 hover:bg-ink-100'
          }`}
        >
          {following ? (
            <span className="flex items-center gap-1.5">
              <UserCheck className="h-4 w-4" /> Following
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <UserPlus className="h-4 w-4" /> Follow
            </span>
          )}
        </button>
        <button
          onClick={handleShare}
          className="rounded-full p-2.5 text-ink-300 transition-colors hover:bg-ink-800 hover:text-white"
          aria-label="Share artist"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Popular tracks */}
      {tracks.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-white">Popular</h2>
          <div className="space-y-0.5">
            {tracks.map((track, i) => (
              <div
                key={track.id}
                className="group flex items-center rounded-md px-2 transition-colors hover:bg-ink-800/40"
              >
                <TrackRow track={track} index={i} queue={tracks} showAlbum={false} />
                <button
                  onClick={(e) => handleTrackMore(e, track)}
                  className="rounded-full p-1.5 text-ink-400 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
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

      {tracks.length === 0 && albums.length === 0 && (
        <div className="py-12 text-center text-ink-400">
          <Disc3 className="mx-auto mb-3 h-10 w-10" />
          No music available from this artist yet.
        </div>
      )}
    </div>
  );
}
